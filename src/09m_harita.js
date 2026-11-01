/* ── Dünya Haritası: tam ekran resimli harita (HARITA) ──
   Büyük Fener ORTADA, 9 diyar etrafında sarmal (halka) şeklinde, altın patika ile bağlı; 10. diyar = fener.
   HARITA.render({ portrait, done, open, next, cur, fezaImg, pirilImg, bitti }) → { svg, vb:[w,h], pos:[{x,y,lx,ly,la}] }
   `svg` birden çok katmandır (sabit resim + bulut + ışık demeti + canlı katman); 09_ui.js bunu hm-svg içine koyar.
   Çizimler 09m_harita_art.js (HARITA_ART). Mor yalnız Pırıl'ın. */
const HARITA = (() => {
  'use strict';
  const A = HARITA_ART, f1 = A.f1;
  const IDS = () => (typeof BOLUM !== 'undefined' && BOLUM.IDS) || A.IDS;

  function render(o) {
    const portrait = !!o.portrait, W = portrait ? 700 : 1000, H = portrait ? 1000 : 700;
    const ids = IDS(), N = ids.length, D = i => (typeof BOLUM !== 'undefined' && BOLUM.diyar ? BOLUM.diyar(ids[i]) : { ad: ids[i], renk: '#ffd27a' });
    const dy = ids.map((_, i) => D(i));
    const done = o.done || {};
    // ── yerleşim: fener ortada, 9 diyar sarmal halka ──
    const cx = W / 2, cy = portrait ? 520 : 380, rx = portrait ? 262 : 400, ry = portrait ? 398 : 250;
    const sc = portrait ? .84 : 1.06, fsc = portrait ? .86 : .8, B = cy + (portrait ? 70 : 52);
    const a0 = 140, step = 38;
    const pos = [];
    for (let i = 0; i < 9; i++) {
      const a = (a0 + step * i) * Math.PI / 180, f = 1 - .03 * i / 8;
      const x = cx + Math.cos(a) * rx * f, y = cy + Math.sin(a) * ry * f;
      pos.push({ x: f1(x), y: f1(y), lx: f1(x), ly: f1(y + 28 * sc), la: 'middle' });
    }
    // fener düğmesi (CSS: 153k x 289k) — düğme tabana yakın başlar; ad etiketi için düzeltmeler
    pos.push({ x: cx, y: B - 112 * fsc, lx: cx + 11.5, ly: B + 62 * fsc + 111, la: 'middle' });
    const S = { x: portrait ? cx - 150 : cx - 175, y: H - (portrait ? 70 : 56) };
    const F = { x: cx + 117 * fsc, y: B + 16 * fsc };
    const nodes = [S, ...pos.slice(0, 9).map(p => ({ x: p.x, y: p.y + 6 })), F];
    const seg = i => {   // i. parça: nodes[i] → nodes[i+1] (Catmull-Rom)
      const p0 = nodes[Math.max(0, i - 1)], p1 = nodes[i], p2 = nodes[i + 1], p3 = nodes[Math.min(nodes.length - 1, i + 2)];
      return `M${f1(p1.x)} ${f1(p1.y)}C${f1(p1.x + (p2.x - p0.x) / 6)} ${f1(p1.y + (p2.y - p0.y) / 6)} ${f1(p2.x - (p3.x - p1.x) / 6)} ${f1(p2.y - (p3.y - p1.y) / 6)} ${f1(p2.x)} ${f1(p2.y)}`;
    };
    const lamp = { x: cx, y: B - 200 * fsc };
    const litArr = ids.slice(0, 9).map(id => !!done[id]);
    const litN = litArr.filter(Boolean).length, K = litN / 9;
    const R = A.rng(11);
    const near = (x, y) => pos.some((p, i) => ((x - p.x) / (i == 9 ? 210 : 105)) ** 2 + ((y - p.y + 18) / (i == 9 ? 190 : 62)) ** 2 < 1) || ((x - cx) / 215) ** 2 + ((y - B + 120) / 200) ** 2 < 1;

    // ══ 1) SABİT KATMAN ══
    let g = `<defs>${A.defs()}
      <radialGradient id="hmSea" cx="${cx / W}" cy="${(cy - 40) / H}" r=".78"><stop offset="0" stop-color="#2f8fa8"/><stop offset=".3" stop-color="#1f5f93"/><stop offset=".65" stop-color="#143a76"/><stop offset="1" stop-color="#070f33"/></radialGradient>
      <radialGradient id="hmPool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".55"/><stop offset=".45" stop-color="#8fe8e0" stop-opacity=".2"/><stop offset="1" stop-color="#8fe8e0" stop-opacity="0"/></radialGradient>
      <linearGradient id="hmAur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ff0c0" stop-opacity=".0"/><stop offset=".5" stop-color="#6ff0c0" stop-opacity=".5"/><stop offset="1" stop-color="#4f9ff0" stop-opacity="0"/></linearGradient>
      <radialGradient id="hmVig" cx=".5" cy=".5" r=".72"><stop offset=".6" stop-color="#050a26" stop-opacity="0"/><stop offset="1" stop-color="#050a26" stop-opacity=".7"/></radialGradient>
      <radialGradient id="hmFog" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d6e0f4" stop-opacity=".92"/><stop offset=".65" stop-color="#b8c6e4" stop-opacity=".7"/><stop offset="1" stop-color="#a0b2d8" stop-opacity="0"/></radialGradient>
      <filter id="hmBl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="12"/></filter></defs>`;
    g += `<rect width="${W}" height="${H}" fill="url(#hmSea)"/>`;
    // kuzey ışıkları
    g += `<g filter="url(#hmBl)" opacity=".5"><path d="M0 60Q${W * .25} ${-10} ${W * .5} 50T${W} 30V130Q${W * .7} 150 ${W * .5} 110T0 140Z" fill="url(#hmAur)"/></g>`;
    // yıldızlar (denizin yansıması + gök)
    for (let i = 0; i < 150; i++) { const x = R() * W, y = R() * H; if (near(x, y)) continue; const r = R() < .12 ? 2 : 1 + R() * .8; g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#fff6d6" opacity="${f1(.25 + R() * .5)}"/>`; }
    // ışık havuzu + sarmal halkalar
    g += `<ellipse cx="${cx}" cy="${cy + 10}" rx="${rx * 1.08}" ry="${ry * 1.08}" fill="url(#hmPool)"/>`;
    [.5, .68, .86, 1.04].forEach((k, i) => g += `<ellipse cx="${cx}" cy="${cy + 8}" rx="${f1(rx * k)}" ry="${f1(ry * k)}" fill="none" stroke="#a8e4ff" stroke-width="${i == 3 ? 1.4 : 1.8}" stroke-dasharray="${2 + i * 3} ${10 + i * 4}" stroke-linecap="round" opacity=".14"/>`);
    // dalgalar
    for (let i = 0; i < 90; i++) { const x = R() * W, y = R() * H; if (near(x, y) || x < 30 || y < 30 || x > W - 30 || y > H - 30) continue; const w = 10 + R() * 16; g += `<path d="M${f1(x)} ${f1(y)}q${f1(w / 4)} -4 ${f1(w / 2)} 0t${f1(w / 2)} 0" fill="none" stroke="#bfe8ff" stroke-width="1.6" opacity="${f1(.14 + R() * .2)}" stroke-linecap="round"/>`; }
    // küçük kayalıklar
    const rock = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cy="9" rx="26" ry="8" fill="#050a22" opacity=".3"/><path d="M-16 6Q-14 -8 -4 -10Q4 -16 12 -6Q18 0 16 6Z" fill="#5a6890"/><path d="M-4 -10Q4 -16 12 -6Q18 0 16 6H4Z" fill="#7d8cb4"/><path d="M-12 -1q4 -10 12 -9" stroke="#b8c4e4" stroke-width="2" fill="none" opacity=".5"/><ellipse cy="7" rx="22" ry="5" fill="none" stroke="#e8f8ff" stroke-width="1.6" opacity=".4"/></g>`;
    (portrait ? [[100, 150, 1.2], [610, 840, 1.1], [90, 760, .9], [620, 170, .9]] : [[88, 400, 1.2], [930, 360, 1.1], [150, 640, .9], [870, 600, .9], [235, 120, .8]]).forEach(([x, y, k]) => g += rock(x, y, k));
    // sevimli balina (köşede)
    const wx = portrait ? W - 130 : W - 120, wy = portrait ? 880 : 618;
    g += `<g transform="translate(${wx} ${wy}) scale(${portrait ? .9 : 1})"><ellipse cy="14" rx="64" ry="12" fill="#050a22" opacity=".3"/><path d="M-50 4Q-46 -22 -8 -24Q34 -26 52 -4Q58 4 48 8Q10 14 -30 12Q-48 12 -50 4Z" fill="#4f86c8"/><path d="M-40 6Q-10 14 40 6Q10 16 -30 12Z" fill="#cfe4f6"/><path d="M-50 4Q-60 -8 -72 -4Q-62 4 -72 12Q-56 14 -50 4Z" fill="#3c6eb0"/><circle cx="22" cy="-8" r="3" fill="#10204a"/><circle cx="20.5" cy="-9.2" r="1" fill="#fff"/><path d="M28 0q5 3 10 0" stroke="#10204a" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="30" cy="-2" r="3.4" fill="#ff9aa8" opacity=".5"/><path d="M-4 -24Q-6 -34 -14 -40M-4 -24Q0 -36 8 -40" stroke="#bfe8ff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/><path d="M-60 14q9 -6 18 0t18 0t18 0t18 0t18 0t18 0" stroke="#e8f8ff" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
    // patikalar
    for (let i = 0; i < N; i++) {
      const id = ids[i], isDone = !!done[id], isOpen = (o.open && o.open[i]) || isDone;
      const d = seg(i);
      if (isDone) g += `<path d="${d}" fill="none" stroke="#ffcf4a" stroke-width="26" stroke-linecap="round" opacity=".3"/><path d="${d}" fill="none" stroke="#ffe08a" stroke-width="8" stroke-linecap="round" opacity=".5"/><path d="${d}" fill="none" stroke="#fff3c4" stroke-width="3.4" stroke-linecap="round"/>`;
      else if (isOpen) g += `<path d="${d}" fill="none" stroke="#ffcf4a" stroke-width="22" stroke-linecap="round" opacity=".22"/><path d="${d}" fill="none" stroke="#ffe08a" stroke-width="6.5" stroke-linecap="round" stroke-dasharray="0.1 13" opacity=".95"/>`;
      else g += `<path d="${d}" fill="none" stroke="#dbe6ff" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="0.1 13" opacity=".4"/>`;
    }
    // başlangıç fenerli şamandıra
    g += `<g transform="translate(${S.x} ${S.y})"><ellipse cy="10" rx="20" ry="6" fill="#050a22" opacity=".4"/><path d="M-12 8Q-14 -2 -8 -4H8Q14 -2 12 8Z" fill="#c9573f"/><rect x="-1.5" y="-26" width="3" height="24" fill="#8a6a45"/><rect x="-7" y="-36" width="14" height="14" rx="5" fill="#ffd45a" stroke="#8a6a45" stroke-width="1.6"/><circle cy="-29" r="3.4" fill="#fffbe8"/>${A.glow(0, -29, 34, 34, 'y', .7)}<ellipse cy="9" rx="22" ry="6" fill="none" stroke="#e8f8ff" stroke-width="1.6" opacity=".5"/></g>`;
    // diyarlar (sabit kısım) — arkadakiler önce
    const ovs = [], veils = [];
    const box = (x, y, w, h, inner, cls = '', st = '') => `<svg viewBox="${f1(x - w / 2)} ${f1(y - h / 2)} ${f1(w)} ${f1(h)}" class="hm-L ${cls}" style="left:${f1((x - w / 2) / W * 100)}%;top:${f1((y - h / 2) / H * 100)}%;width:${f1(w / W * 100)}%;height:${f1(h / H * 100)}%;${st}" aria-hidden="true">${inner}</svg>`;
    const order = [...Array(9).keys()].sort((a, b) => pos[a].y - pos[b].y);
    order.forEach(i => {
      const id = ids[i], p = pos[i], isDone = !!done[id], ok = (o.open && o.open[i]) || isDone, nx = o.next === id;
      const m = A.mini(id, ok);
      g += `<g transform="translate(${p.x} ${p.y}) scale(${sc})">`;
      if (isDone) g += A.glow(0, -10, 100, 56, 'y', .5);
      if (nx) g += A.glow(0, -14, 118, 74, 'w', .85);
      g += m.s;
      if (isDone) g += `<g transform="translate(-70 -4)"><rect x="-1.5" y="-46" width="3" height="48" fill="#8a6a45"/><path d="M1.5 -46Q14 -42 22 -46L18 -37L22 -28Q12 -32 1.5 -28Z" fill="#ffd45a"/>${A.glow(0, -22, 30, 30, 'y', .6)}<rect x="-6" y="-30" width="12" height="14" rx="4" fill="#ffcf5a" stroke="#8a6a45" stroke-width="1.5"/><circle cy="-23" r="3.2" fill="#fffbe8"/></g>`;
      g += '</g>';
      ovs.push(box(p.x, p.y - 60 * sc, 210 * sc, 150 * sc, `<g transform="translate(${p.x} ${p.y}) scale(${sc})">${m.ov.join('')}</g>`));
      if (!ok) veils.push(`<g transform="translate(${p.x} ${p.y}) scale(${sc})"><ellipse cy="-6" rx="86" ry="52" fill="url(#hmFog)" opacity=".5"/><ellipse cx="32" cy="8" rx="46" ry="11" fill="#e2eaf8" opacity=".42"/><ellipse cx="-24" cy="14" rx="44" ry="10" fill="#e2eaf8" opacity=".4"/></g>`);
    });
    g += veils.join('');
    // Büyük Fener (ortada)
    g += `<g transform="translate(${cx} ${B}) scale(${fsc})">${A.fener(litArr, dy.slice(0, 9).map(d => d.renk), !!done[ids[9]])}</g>`;
    // çerçeve + pusula
    const gold = '#e8c870';
    g += `<rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="22" fill="none" stroke="${gold}" stroke-width="2.4" opacity=".55"/><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="17" fill="none" stroke="${gold}" stroke-width="1" opacity=".35"/>`;
    [[16, 16, 1, 1], [W - 16, 16, -1, 1], [16, H - 16, 1, -1], [W - 16, H - 16, -1, -1]].forEach(([x, y, sx, sy]) => g += `<g transform="translate(${x} ${y}) scale(${sx} ${sy})"><path d="M4 30Q4 4 30 4" stroke="${gold}" stroke-width="2.6" fill="none" opacity=".8"/>${A.star(14, 14, 7, gold, .9)}</g>`);
    const kx = portrait ? 80 : 84, ky = portrait ? H - 84 : H - 80;
    g += `<g transform="translate(${kx} ${ky})" opacity=".92"><circle r="38" fill="#0b1a44" opacity=".5" stroke="${gold}" stroke-width="1.6"/><circle r="30" fill="none" stroke="${gold}" stroke-width=".8" opacity=".6"/><path d="M0 -36L6 -6L36 0L6 6L0 36L-6 6L-36 0L-6 -6Z" fill="#ffe9a8"/><path d="M0 -36L6 -6L0 0Z M36 0L6 6L0 0Z M0 36L-6 6L0 0Z M-36 0L-6 -6L0 0Z" fill="#c8963a"/><path d="M-22 -22L-4 -4L-22 -22ZM22 -22L4 -4M22 22L4 4M-22 22L-4 4" stroke="${gold}" stroke-width="2.4"/><circle r="4" fill="#ff8fb8"/></g>`;
    g += `<rect width="${W}" height="${H}" fill="url(#hmVig)" pointer-events="none"/>`;
    let L0 = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" class="hm-L0" aria-hidden="true">${g}</svg>`;

    // ══ 2) BULUTLAR: her bulut kendi küçük katmanı (GPU ucuz) ══
    const cloud = (x, y, k, op, i) => box(x, y, 190 * k, 70 * k, `<g transform="translate(${x} ${y}) scale(${k})" opacity="${op}"><ellipse rx="70" ry="16" fill="#cdd9f4"/><ellipse cx="-34" cy="-10" rx="34" ry="15" fill="#cdd9f4"/><ellipse cx="14" cy="-16" rx="40" ry="19" fill="#d8e2f8"/><ellipse cx="46" cy="-4" rx="30" ry="13" fill="#cdd9f4"/></g>`, 'hm-cl', `animation-delay:${-i * 9}s;animation-duration:${50 + i * 7}s`);
    const cl = portrait ? [[60, 110, 1.3, .2], [640, 250, 1.1, .17], [40, 520, 1.0, .15], [660, 640, 1.2, .18], [180, 960, 1.4, .2], [560, 40, 1.0, .15]]
      : [[110, 90, 1.2, .2], [880, 130, 1.3, .18], [70, 330, 1.0, .15], [940, 500, 1.1, .18], [330, 670, 1.3, .2], [700, 40, 1.0, .15], [770, 660, 1.2, .17]];
    const L1 = cl.slice(0, 2).map((c, i) => cloud(...c, i)).join('');
    L0 = L0.replace('</svg>', cl.slice(2).map(([x, y, k, op]) => `<g transform="translate(${x} ${y}) scale(${k})" opacity="${op}"><ellipse rx="70" ry="16" fill="#cdd9f4"/><ellipse cx="-34" cy="-10" rx="34" ry="15" fill="#cdd9f4"/><ellipse cx="14" cy="-16" rx="40" ry="19" fill="#d8e2f8"/><ellipse cx="46" cy="-4" rx="30" ry="13" fill="#cdd9f4"/></g>`).join('') + '</svg>');


    let wv = ''; for (let r = 0; r < 2; r++) { let d = ''; for (let k = 0; k < 7; k++) { const y0 = H * (.2 + k * .11 + r * .05); d += `M-60 ${f1(y0)}` + `q30 -9 60 0t60 0`.repeat(Math.ceil((W + 240) / 120)); } wv += `<path class="hm-wv hm-wv${r}" d="${d}" fill="none" stroke="#bfe8ff" stroke-width="1.8" stroke-linecap="round" opacity="${r ? .1 : .14}"/>`; }
    const LW = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" class="hm-L0 hm-Lw" aria-hidden="true">${wv}</svg>`;
    // ══ 3) IŞIK DEMETİ: yalnız fenerin çevresindeki kare dönüyor ══
    const bl = 210, bo = (.3 + .5 * K).toFixed(2), NB = 12;   // dönen demet: 12 yelpaze, sırayla belirip siliniyor (dönüş gibi, ucuz)
    let wd = '';
    for (let k = 0; k < NB; k++) wd += `<path d="M0 -3L${bl} -26V26L0 3ZM0 -3L${-bl} -26V26L0 3Z" fill="url(#hmBm)" transform="rotate(${k * 180 / NB})" opacity="0"><animate attributeName="opacity" values="0;.5;.5;0;0" keyTimes="0;.06;.16;.3;1" dur="${NB * 1.4}s" begin="${-k * 1.4}s" repeatCount="indefinite"/></path>`;
    const L2 = box(lamp.x, lamp.y, 2 * bl + 10, 2 * bl + 10, `<defs><linearGradient id="hmBm" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${bl}" y2="0"><stop offset="0" stop-color="#fff0a8" stop-opacity=".7"/><stop offset=".5" stop-color="#ffe9a0" stop-opacity=".25"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></linearGradient></defs><g transform="translate(${lamp.x} ${lamp.y})" opacity="${bo}">${wd}</g>`);

    // ══ 4) CANLI PARÇALAR (hepsi küçük, ayrı katman) ══
    let v = '';
    for (let i = 0; i < 5; i++) { const x = R() * W, y = R() * H; if (near(x, y)) { continue; } v += box(x, y, 24, 24, `<g transform="translate(${f1(x)} ${f1(y)})"><g class="hm-tw" style="animation-delay:${f1(-R() * 4)}s">${A.sparkle(0, 0, 3 + R() * 3)}</g></g>`); }
    // fener ışık kıvılcımları (yanan yüzlerin renginde)
    let sp = '';
    litArr.forEach((l, i) => { if (!l) return; const c = dy[i].renk, a = i / 9 * Math.PI * 2; sp += `<circle cx="${f1(lamp.x)}" cy="${f1(lamp.y)}" r="3.2" fill="${c}"><animateMotion dur="${9 + i}s" repeatCount="indefinite" begin="${-i}s" path="M0 0m${f1(Math.cos(a) * 40)} ${f1(Math.sin(a) * 18)}a${f1(70 + i * 3)} ${f1(30 + i * 2)} 0 1 1 1 0z"/><animate attributeName="opacity" values=".3;1;.3" dur="2.5s" repeatCount="indefinite" begin="${-i * .3}s"/></circle>`; });
    if (sp) v += box(lamp.x, lamp.y, 300, 150, sp);
    v += ovs.join('');
    // yüzen fenerler
    for (let i = 0; i < 4; i++) { const x = portrait ? 60 + R() * 580 : 50 + R() * 900, y = portrait ? 700 + R() * 260 : 450 + R() * 220; if (near(x, y)) continue; v += box(x + 4, y - 20, 50, 90, `<g transform="translate(${f1(x)} ${f1(y)})"><g><animateTransform attributeName="transform" type="translate" values="0 0;8 -${30 + i * 4};0 0" dur="${8 + i}s" repeatCount="indefinite"/>${A.glow(0, 0, 16, 16, 'o', .7)}<rect x="-4" y="-5" width="8" height="10" rx="3" fill="#ffb347"/><rect x="-2" y="-3" width="4" height="5" rx="2" fill="#fff3c0"/></g></g>`); }

    // kuş sürüleri (iki küçük sürü, ayrı katman)
    const bird = (dx, dy, d) => `<path d="M${dx - 7} ${dy}Q${dx - 3.5} ${dy - 6} ${dx} ${dy}Q${dx + 3.5} ${dy - 6} ${dx + 7} ${dy}" fill="none" stroke="#fff4dc" stroke-width="2" stroke-linecap="round"><animate attributeName="d" dur=".9s" begin="${d}s" repeatCount="indefinite" values="M${dx - 7} ${dy}Q${dx - 3.5} ${dy - 6} ${dx} ${dy}Q${dx + 3.5} ${dy - 6} ${dx + 7} ${dy};M${dx - 7} ${dy - 4}Q${dx - 3.5} ${dy + 1} ${dx} ${dy}Q${dx + 3.5} ${dy + 1} ${dx + 7} ${dy - 4};M${dx - 7} ${dy}Q${dx - 3.5} ${dy - 6} ${dx} ${dy}Q${dx + 3.5} ${dy - 6} ${dx + 7} ${dy}"/></path>`;
    const flock = (path, dur, begin) => `<g opacity=".85"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${path}"/>${bird(0, 0, 0)}${bird(-16, 8, .2)}${bird(14, 9, .4)}</g>`;
    v += portrait ? box(W / 2, 330, W + 80, 260, flock('M-30 220C150 150 400 260 740 120', 38, -6)) : box(W / 2, 250, W + 80, 260, flock('M-30 200C250 120 600 260 1040 110', 40, -8) );
    // ışıldayan yıldız kümeleri (kenarlarda)
    for (let i = 0; i < 7; i++) { const x = 40 + R() * (W - 80), y = 40 + R() * (H - 80); if (near(x, y)) continue; v += box(x, y, 30, 30, `<g transform="translate(${f1(x)} ${f1(y)})"><g class="hm-tw" style="animation-delay:${f1(-R() * 4)}s">${A.sparkle(0, 0, 5 + R() * 4, '#fff2b0')}</g></g>`); }
    // yelkenli tekneler
    const boat = (x, y, k, dur) => box(x + 60, y - 10, 180, 70, `<g transform="translate(${x} ${y}) scale(${k})"><g><animateMotion dur="${dur}s" repeatCount="indefinite" path="M0 0q30 -8 60 0t60 0t-60 6t-60 -6z"/><path d="M-12 0H12L8 7H-8Z" fill="#a8603a"/><path d="M0 -3V-30L14 -6Z" fill="#fff6e0"/><path d="M-1.5 -3V-26L-12 -6Z" fill="#ffd9a0"/><path d="M-16 8q16 -4 32 0" stroke="#e8f8ff" stroke-width="1.6" fill="none" opacity=".6"/></g></g>`);
    v += portrait ? boat(60, 640, 1, 20) + boat(430, 900, .9, 24) : boat(330, 642, 1, 20) + boat(780, 620, .9, 26);
    // uçan ejderha silueti (bir tane, üst şerit)
    const drg = (path, dur, k, d) => `<g><animateMotion dur="${dur}s" begin="${d}s" repeatCount="indefinite" path="${path}" rotate="auto"/><g transform="scale(${k})" opacity=".78"><path d="M-14 0Q-5 -3 5 0L18 -3L10 2L20 6L7 4Q0 7 -7 4L-18 7L-10 2Z" fill="#2a2450"/><path d="M-4 -1L-1 -13L5 -2Z" fill="#3a3466"><animate attributeName="d" dur=".6s" repeatCount="indefinite" values="M-4 -1L-1 -13L5 -2Z;M-4 0L-1 7L5 0Z;M-4 -1L-1 -13L5 -2Z"/></path></g></g>`;
    v += box(W / 2, 80, W + 100, 120, portrait ? drg('M-40 120C200 60 500 160 760 90', 30, 1.2, 0) : drg('M-40 70C250 20 700 120 1040 50', 32, 1.2, -4));
    if (done[ids[9]]) {   // hedef: bütün parçalar yandı → fener şölen yapar
      let cel = `<g transform="translate(${lamp.x} ${B - 282 * fsc})"><g class="hm-spin" style="animation-duration:18s">${[...Array(12).keys()].map(k => `<path d="M0 0L-7 -150L7 -150Z" fill="#fff2b0" opacity="${k % 2 ? .12 : .2}" transform="rotate(${k * 30})"/>`).join('')}</g>${A.glow(0, 0, 150, 150, 'y', .55)}${A.glow(0, 0, 70, 70, 'wt', .6)}</g>`;
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; cel += `<g transform="translate(${f1(lamp.x + Math.cos(a) * 110)} ${f1(lamp.y + Math.sin(a) * 70)})"><g class="hm-tw" style="animation-delay:${f1(-i * .3)}s">${A.sparkle(0, 0, 5 + i % 3 * 2, '#fff2b0')}</g></g>`; }
      v += box(lamp.x, lamp.y - 40, 340, 330, cel);
    }
    // sıradaki diyar: nabız halkası + Feza işareti
    const head = (x, y, pir) => (pir ? o.pirilImg : o.fezaImg)
      ? `<g transform="translate(${x} ${y})"><circle r="21" fill="#fff"/><image href="${pir ? o.pirilImg : o.fezaImg}" x="-19" y="-19" width="38" height="38"/></g>`
      : pir
        ? `<g transform="translate(${x} ${y})"><path d="M-12 -8L-9 -20L-3 -10M3 -10L9 -20L12 -8" fill="#a6d65a"/><ellipse rx="15" ry="12.5" fill="#b184e2" stroke="#fff" stroke-width="2"/><circle cx="-5.5" cy="-1" r="2" fill="#3b2a52"/><circle cx="5.5" cy="-1" r="2" fill="#3b2a52"/><path d="M-3 4Q0 7 3 4" stroke="#6a3f6e" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`
        : `<g transform="translate(${x} ${y})"><circle r="15" fill="#ffd6aa" stroke="#fff" stroke-width="2"/><path d="M-15 -2Q-17 -17 -2 -17Q15 -19 15 -2L9 -9L1 -6L-3 -11L-10 -6Z" fill="#8c542d"/><circle cx="-5" cy="1" r="2" fill="#332843"/><circle cx="5" cy="1" r="2" fill="#332843"/><path d="M-3 7Q0 10 3 7" stroke="#a15b53" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;
    const ni = ids.indexOf(o.next);
    if (ni >= 0) {
      const p = ni < 9 ? pos[ni] : { x: cx, y: B - 250 * fsc }, k = ni < 9 ? sc : fsc, top = ni < 9 ? p.y - 112 * k : p.y - 60;
      v += box(p.x, p.y - 60 * k, 240 * k, 190 * k, `<ellipse cx="${p.x}" cy="${p.y - 4}" rx="${92 * k}" ry="${40 * k}" fill="none" stroke="#ffe27a" stroke-width="3" opacity=".9"><animate attributeName="rx" values="${70 * k};${110 * k}" dur="2s" repeatCount="indefinite"/><animate attributeName="ry" values="${28 * k};${48 * k}" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".95;0" dur="2s" repeatCount="indefinite"/></ellipse><g transform="translate(${p.x} ${top})"><g class="hm-pir"><path d="M-9 17L0 31L9 17Z" fill="#fff" stroke="#ffcf4a" stroke-width="2"/><circle r="24" fill="#fff" stroke="#ffcf4a" stroke-width="3.5"/>${A.glow(0, 0, 44, 44, 'y', .6)}${head(0, 0, false)}</g></g>`);
    }
    // Pırıl yol gösteriyor: son açılan parçada uçar
    const wings = `<ellipse cx="-17" cy="-2" rx="11" ry="5" fill="#d8f0ff" opacity=".85" transform="rotate(-25 -17 -2)"></ellipse><ellipse cx="17" cy="-2" rx="11" ry="5" fill="#d8f0ff" opacity=".85" transform="rotate(25 17 -2)"></ellipse>`;
    const guide = `<g>${wings}<g class="hm-pir">${A.glow(0, 0, 34, 34, 'p', .55)}${head(0, 0, true).replace('r="21"', 'r="17"')}</g></g>`;
    if (ni >= 0) {
      const a = nodes[ni], b = nodes[ni + 1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, bw = Math.abs(a.x - b.x) + 160, bh = Math.abs(a.y - b.y) + 160;
      v += box(mx, my, bw, bh, `<g opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.88;1" dur="7s" repeatCount="indefinite"/><animateMotion dur="7s" repeatCount="indefinite" path="${seg(ni)}" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".4 0 .6 1"/>${guide}</g>`);
    } else v += box(lamp.x, lamp.y, 260, 150, `<g><animateMotion dur="14s" repeatCount="indefinite" path="M${lamp.x - 90} ${lamp.y}a90 40 0 1 1 180 0a90 40 0 1 1 -180 0z"/>${guide}</g>`);

    return { svg: L0 + LW + L1 + L2 + v, vb: [W, H], pos };
  }
  return { render };
})();
