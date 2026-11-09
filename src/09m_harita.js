/* ── Dünya Haritası: tam ekran resimli harita (HARITA) ──
   Büyük Fener ORTADA, 9 diyar etrafında sarmal (halka) şeklinde, altın patika ile bağlı; 10. diyar = fener.
   HARITA.render({ portrait, done, open, next, cur, fezaImg, pirilImg, bitti }) → { svg, vb:[w,h], pos:[{x,y,lx,ly,la}] }
   `svg` birden çok katmandır (sabit resim + bulut + ışık demeti + canlı katman); 09_ui.js bunu hm-svg içine koyar.
   Çizimler 09m_harita_art.js (HARITA_ART). Mor yalnız Pırıl'ın. */
const HARITA = (() => {
  'useStrict';
  const A = HARITA_ART, f1 = A.f1;
  const IDS = () => (typeof BOLUM !== 'undefined' && BOLUM.IDS) || A.IDS;
  // 9 diyar + fener için canlı, parlak vitray renkleri (mor yok)
  const PAL = ['#ff78a8', '#48d8f8', '#58dc78', '#ffd24c', '#64ecff', '#74a8ff', '#ff7a44', '#ffaa64', '#ff6e92', '#ffe478'];
  const hexCol = (c, i) => (typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c)) ? c : PAL[i % PAL.length];

  function render(o) {
    const portrait = !!o.portrait, W = portrait ? 700 : 1000, H = portrait ? 1000 : 700;
    const ids = IDS(), N = ids.length, D = i => (typeof BOLUM !== 'undefined' && BOLUM.diyar ? BOLUM.diyar(ids[i]) : { ad: ids[i], renk: PAL[i] });
    const dy = ids.map((_, i) => { const d = D(i) || {}; return { ad: d.ad || ids[i], renk: hexCol(d.renk, i) }; });
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
    const lamp = { x: cx, y: B - 202 * fsc };
    const litArr = ids.slice(0, 9).map(id => !!done[id]);
    const litN = litArr.filter(Boolean).length, K = litN / 9;
    const R = A.rng(11);
    const near = (x, y) => pos.some((p, i) => ((x - p.x) / (i == 9 ? 210 : 105)) ** 2 + ((y - p.y + 18) / (i == 9 ? 190 : 62)) ** 2 < 1) || ((x - cx) / 215) ** 2 + ((y - B + 120) / 200) ** 2 < 1;

    // ══ 1) SABİT KATMAN (L0: GPU'da tek kez çizilip önbelleklenir) ══
    let g = `<defs>${A.defs()}
      <radialGradient id="hmSea" cx="${f1(cx / W)}" cy="${f1((cy - 36) / H)}" r=".82">
        <stop offset="0" stop-color="#36a2b8"/>
        <stop offset=".26" stop-color="#1f689c"/>
        <stop offset=".6" stop-color="#113874"/>
        <stop offset="1" stop-color="#050b26"/>
      </radialGradient>
      <radialGradient id="hmPool" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#ffeaa0" stop-opacity="${f1(.48 + .24 * K)}"/>
        <stop offset=".42" stop-color="#7ef0e4" stop-opacity=".24"/>
        <stop offset="1" stop-color="#7ef0e4" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hmAur" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#64f4c8" stop-opacity="0"/>
        <stop offset=".35" stop-color="#64f4c8" stop-opacity=".48"/>
        <stop offset=".7" stop-color="#ffe28a" stop-opacity=".34"/>
        <stop offset="1" stop-color="#4ca4f8" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="hmVig" cx=".5" cy=".5" r=".74">
        <stop offset=".62" stop-color="#040820" stop-opacity="0"/>
        <stop offset="1" stop-color="#040820" stop-opacity=".72"/>
      </radialGradient>
      <radialGradient id="hmFog" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#dce6f8" stop-opacity=".9"/>
        <stop offset=".65" stop-color="#b8c8e8" stop-opacity=".68"/>
        <stop offset="1" stop-color="#9eb2dc" stop-opacity="0"/>
      </radialGradient>
      <filter id="hmBl" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>`;

    // Derin büyülü okyanus zemini + kuzey ışıkları (Aurora)
    g += `<rect width="${W}" height="${H}" fill="url(#hmSea)"/>`;
    g += `<g filter="url(#hmBl)" opacity=".58">
      <path d="M0 55Q${W * .25} -15 ${W * .52} 48T${W} 28V125Q${W * .72} 148 ${W * .48} 105T0 135Z" fill="url(#hmAur)"/>
      <path d="M0 ${H - 80}Q${W * .3} ${H - 130} ${W * .65} ${H - 70}T${W} ${H - 95}V${H}H0Z" fill="url(#hmAur)" opacity=".45"/>
    </g>`;

    // Köşelerde masalsı takımyıldız çizgileri (Constellations)
    const constel = pts => {
      let s = `<path d="M${pts.map(p => p.join(' ')).join('L')}" fill="none" stroke="#a8dcff" stroke-width="1.2" stroke-dasharray="3 5" opacity=".38"/>`;
      pts.forEach(([x, y], i) => {
        s += `<circle cx="${x}" cy="${y}" r="${i === 0 ? 2.6 : 1.9}" fill="#fff6d6" opacity=".82"/>`;
        if (i % 2 === 0) s += A.sparkle(x, y, 4.5, '#ffe9a8');
      });
      return s;
    };
    if (!portrait) {
      g += constel([[48, 86], [82, 64], [124, 74], [148, 46], [112, 34], [82, 64]]);
      g += constel([[845, 52], [888, 38], [932, 62], [956, 40], [918, 88]]);
      g += constel([[44, 540], [74, 575], [62, 618], [108, 636]]);
    } else {
      g += constel([[46, 86], [88, 62], [132, 78], [156, 48]]);
      g += constel([[540, 56], [588, 42], [634, 68], [612, 102]]);
    }

    // Yıldız tozu ve deniz parıltıları
    for (let i = 0; i < 165; i++) {
      const x = R() * W, y = R() * H;
      if (near(x, y)) continue;
      const r = R() < .15 ? 2.2 : 1 + R() * .9;
      const col = R() < .3 ? '#bfe8ff' : R() < .6 ? '#ffe898' : '#fff8e2';
      g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}" opacity="${f1(.28 + R() * .55)}"/>`;
    }

    // Merkez ışık havuzu + Astrolab / Harita sarmal halkaları
    g += `<ellipse cx="${cx}" cy="${cy + 10}" rx="${f1(rx * 1.12)}" ry="${f1(ry * 1.12)}" fill="url(#hmPool)"/>`;
    [.46, .64, .82, 1.02, 1.12].forEach((k, i) => {
      const col = i % 2 ? '#ffe28a' : '#a8e4ff';
      g += `<ellipse cx="${cx}" cy="${cy + 8}" rx="${f1(rx * k)}" ry="${f1(ry * k)}" fill="none" stroke="${col}" stroke-width="${i === 4 ? 1 : 1.6}" stroke-dasharray="${i === 4 ? '2 8' : (3 + i * 3) + ' ' + (9 + i * 4)}" stroke-linecap="round" opacity="${i === 4 ? .22 : .18}"/>`;
    });

    // Deniz dalgacıkları
    for (let i = 0; i < 90; i++) {
      const x = R() * W, y = R() * H;
      if (near(x, y) || x < 32 || y < 32 || x > W - 32 || y > H - 32) continue;
      const w = 10 + R() * 16;
      g += `<path d="M${f1(x)} ${f1(y)}q${f1(w / 4)} -4 ${f1(w / 2)} 0t${f1(w / 2)} 0" fill="none" stroke="#c4ecff" stroke-width="1.6" opacity="${f1(.15 + R() * .22)}" stroke-linecap="round"/>`;
    }

    // Küçük deniz kayalıkları
    const rock = (x, y, k) =>
      `<g transform="translate(${x} ${y}) scale(${k})">` +
      `<ellipse cy="9" rx="28" ry="8.5" fill="#040920" opacity=".36"/>` +
      `<path d="M-17 6Q-15 -9 -4 -11Q4 -18 13 -7Q19 0 17 6Z" fill="#546692"/>` +
      `<path d="M-4 -11Q4 -18 13 -7Q19 0 17 6H4Z" fill="#7c8eb8"/>` +
      `<path d="M-12 -1q4 -10 12 -9" stroke="#c8d6f4" stroke-width="2" fill="none" opacity=".6"/>` +
      `<ellipse cy="7" rx="23" ry="5.5" fill="none" stroke="#eafaff" stroke-width="1.7" opacity=".48" stroke-dasharray="10 5"/>` +
      `</g>`;
    (portrait ? [[100, 150, 1.2], [610, 840, 1.1], [90, 760, .9], [620, 170, .9]]
              : [[88, 400, 1.2], [930, 360, 1.1], [150, 640, .9], [870, 600, .9], [235, 120, .8]]
    ).forEach(([x, y, k]) => g += rock(x, y, k));

    // Sevimli mavi balina (sağ alt köşede)
    const wx = portrait ? W - 130 : W - 120, wy = portrait ? 880 : 618;
    g += `<g transform="translate(${wx} ${wy}) scale(${portrait ? .92 : 1.04})">` +
      `<ellipse cy="14" rx="66" ry="13" fill="#040920" opacity=".35"/>` +
      `<path d="M-52 4Q-48 -24 -8 -26Q36 -28 54 -4Q60 4 50 9Q10 15 -30 13Q-50 13 -52 4Z" fill="#4682c8"/>` +
      `<path d="M-44 -10Q-12 -24 28 -16" stroke="#8cc4ff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".55"/>` +
      `<path d="M-40 6Q-10 15 42 6Q10 17 -30 13Z" fill="#d8ecfc"/>` +
      `<path d="M-52 4Q-62 -9 -74 -5Q-64 4 -74 13Q-58 15 -52 4Z" fill="#3668ac"/>` +
      `<circle cx="23" cy="-8" r="3.2" fill="#0e1e48"/><circle cx="21.5" cy="-9.2" r="1.1" fill="#fff"/>` +
      `<path d="M29 0q5 3.5 10 0" stroke="#0e1e48" stroke-width="1.9" fill="none" stroke-linecap="round"/>` +
      `<circle cx="31" cy="-2" r="3.6" fill="#ff98a8" opacity=".55"/>` +
      `<path d="M-4 -26Q-7 -37 -16 -43M-4 -26Q1 -39 10 -43" stroke="#c8f0ff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"/>` +
      `<path d="M-62 14q9 -6 18 0t18 0t18 0t18 0t18 0t18 0" stroke="#eafaff" stroke-width="2.5" fill="none" opacity=".65" stroke-linecap="round"/>` +
      `</g>`;

    // ── ALTIN YILDIZLI PATİKALAR (Adalar arası yollar) ──
    for (let i = 0; i < N; i++) {
      const id = ids[i], isDone = !!done[id], isOpen = (o.open && o.open[i]) || isDone;
      const d = seg(i);
      if (isDone) {
        g += `<path d="${d}" fill="none" stroke="#ffba30" stroke-width="28" stroke-linecap="round" opacity=".3"/>` +
             `<path d="${d}" fill="none" stroke="#ffd868" stroke-width="11" stroke-linecap="round" opacity=".58"/>` +
             `<path d="${d}" fill="none" stroke="#fff6cf" stroke-width="4" stroke-linecap="round"/>` +
             `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0.1 14" opacity=".9"/>`;
      } else if (isOpen) {
        g += `<path d="${d}" fill="none" stroke="#ffcf4a" stroke-width="24" stroke-linecap="round" opacity=".25"/>` +
             `<path d="${d}" fill="none" stroke="#ffe694" stroke-width="7.2" stroke-linecap="round" stroke-dasharray="0.1 13" opacity=".98"/>`;
      } else {
        g += `<path d="${d}" fill="none" stroke="#c8dcff" stroke-width="4.6" stroke-linecap="round" stroke-dasharray="0.1 13" opacity=".42"/>`;
      }
    }

    // Başlangıç Fenerli Şamandıra (S düğümü)
    g += `<g transform="translate(${S.x} ${S.y})">` +
      `<ellipse cy="10" rx="22" ry="6.5" fill="#040920" opacity=".45"/>` +
      `<path d="M-14 8Q-16 -2 -9 -5H9Q16 -2 14 8Z" fill="#d4523a" stroke="#f6c88a" stroke-width="1.2"/>` +
      `<rect x="-2" y="-28" width="4" height="25" rx="1" fill="#8a643c"/>` +
      `<rect x="-8" y="-39" width="16" height="15" rx="5" fill="#ffd658" stroke="#8a643c" stroke-width="1.8"/>` +
      `<circle cy="-31.5" r="4" fill="#fffef0"/>${A.glow(0, -31, 38, 38, 'y', .8)}` +
      `<ellipse cy="9" rx="24" ry="6.5" fill="none" stroke="#eafaff" stroke-width="1.8" opacity=".55" stroke-dasharray="10 5"/>` +
      `</g>`;

    // ── 9 DİYAR ADASI (Sabit katman + Canlı katman kutuları) ──
    const ovs = [], veils = [];
    const box = (x, y, w, h, inner, cls = '', st = '') =>
      `<svg viewBox="${f1(x - w / 2)} ${f1(y - h / 2)} ${f1(w)} ${f1(h)}" class="hm-L ${cls}" style="left:${f1((x - w / 2) / W * 100)}%;top:${f1((y - h / 2) / H * 100)}%;width:${f1(w / W * 100)}%;height:${f1(h / H * 100)}%;${st}" aria-hidden="true">${inner}</svg>`;

    const order = [...Array(9).keys()].sort((a, b) => pos[a].y - pos[b].y);
    order.forEach(i => {
      const id = ids[i], p = pos[i], isDone = !!done[id], ok = (o.open && o.open[i]) || isDone, nx = o.next === id;
      const m = A.mini(id, ok);
      g += `<g transform="translate(${p.x} ${p.y}) scale(${sc})">`;
      if (isDone) g += A.glow(0, -10, 108, 62, 'y', .58);
      if (nx) g += A.glow(0, -12, 124, 78, 'w', .92);
      g += m.s;
      // Tamamlanan adada Kraliyet Altın Sancağı ve Yıldız Feneri
      if (isDone) {
        g += `<g transform="translate(-70 -4)">` +
          `<ellipse cy="3" rx="7" ry="2.5" fill="#050b24" opacity=".4"/>` +
          `<rect x="-1.8" y="-49" width="3.6" height="51" rx="1.2" fill="url(#hmGld)"/>` +
          `<circle cy="-51" r="3" fill="#fff2a8"/>` +
          `<path d="M1.8 -48Q15 -43 25 -48L20 -38L25 -28Q14 -33 1.8 -28Z" fill="#ffd44e" stroke="#b87c1e" stroke-width="1"/>` +
          `${A.glow(0, -23, 34, 34, 'y', .7)}` +
          `<rect x="-6.5" y="-31" width="13" height="15" rx="4.5" fill="#ffd254" stroke="#8a5e2c" stroke-width="1.6"/>` +
          `<circle cy="-23.5" r="3.6" fill="#fffef2"/>` +
          `</g>`;
      }
      g += '</g>';
      ovs.push(box(p.x, p.y - 60 * sc, 210 * sc, 150 * sc, `<g transform="translate(${p.x} ${p.y}) scale(${sc})">${m.ov.join('')}</g>`));
      if (!ok) {   // henüz açılmamış diyar: pus yok (resim net kalır) — yalnız hafif bir tül ve eteğinde iki küçük bulut
        const puff = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cy="4" rx="30" ry="6.5" fill="#7f94c4" opacity=".45"/><ellipse rx="29" ry="7.5" fill="#e6edfa"/><ellipse cx="-11" cy="-5" rx="13" ry="7.5" fill="#f2f6fe"/><ellipse cx="8" cy="-7" rx="15" ry="8.5" fill="#ffffff"/></g>`;
        veils.push(`<g transform="translate(${p.x} ${p.y}) scale(${sc})"><ellipse cy="-6" rx="82" ry="48" fill="url(#hmFog)" opacity=".12"/><g opacity=".78">${puff(44, 12, .9)}${puff(-46, 17, .78)}</g></g>`);
      }
    });
    g += veils.join('');

    // ── BÜYÜK FENER (Merkezde) ──
    g += `<g transform="translate(${cx} ${B}) scale(${fsc})">${A.fener(litArr, dy.slice(0, 9).map(d => d.renk), !!done[ids[9]])}</g>`;

    // Masalsı bulut kümeleri (sabit katmandakiler: ay ışığı kenarlı)
    const cloudSvg = (x, y, k, op) =>
      `<g transform="translate(${x} ${y}) scale(${k})" opacity="${op}">` +
      `<ellipse cy="4" rx="72" ry="16" fill="#7c96cc"/>` +
      `<ellipse rx="70" ry="15" fill="#cedcf6"/>` +
      `<ellipse cx="-34" cy="-10" rx="35" ry="16" fill="#d8e4fa"/>` +
      `<ellipse cx="14" cy="-16" rx="42" ry="20" fill="#eef4ff"/>` +
      `<ellipse cx="46" cy="-4" rx="31" ry="14" fill="#d8e4fa"/>` +
      `<path d="M-62 -8Q-36 -25 -6 -16Q16 -34 48 -18" fill="none" stroke="#fff8e6" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>` +
      `</g>`;

    const cl = portrait
      ? [[60, 110, 1.3, .22], [640, 250, 1.1, .18], [40, 520, 1.0, .16], [660, 640, 1.2, .19], [180, 960, 1.4, .22], [560, 40, 1.0, .16]]
      : [[110, 90, 1.2, .22], [880, 130, 1.3, .19], [70, 330, 1.0, .16], [940, 500, 1.1, .19], [330, 670, 1.3, .22], [700, 40, 1.0, .16], [770, 660, 1.2, .18]];
    cl.slice(2).forEach(([x, y, k, op]) => { g += cloudSvg(x, y, k, op); });

    // ── KRALİYET ATLAS ÇERÇEVESİ VE PUSULA GÜLÜ ──
    const gold = '#eccb72', goldHi = '#fff2be';
    g += `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="24" fill="none" stroke="#8a6420" stroke-width="4" opacity=".55"/>`;
    g += `<rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="22" fill="none" stroke="${gold}" stroke-width="2.6" opacity=".78"/>`;
    g += `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="17" fill="none" stroke="${goldHi}" stroke-width="1.1" opacity=".45" stroke-dasharray="12 6 3 6"/>`;
    // Köşe filigran süslemeleri
    [[16, 16, 1, 1], [W - 16, 16, -1, 1], [16, H - 16, 1, -1], [W - 16, H - 16, -1, -1]].forEach(([x, y, sx, sy]) => {
      g += `<g transform="translate(${x} ${y}) scale(${sx} ${sy})">` +
           `<path d="M3 42Q3 3 42 3" stroke="${gold}" stroke-width="3" fill="none"/>` +
           `<path d="M8 28Q8 8 28 8" stroke="${goldHi}" stroke-width="1.4" fill="none" opacity=".75"/>` +
           `<circle cx="38" cy="4" r="2.2" fill="${goldHi}"/><circle cx="4" cy="38" r="2.2" fill="${goldHi}"/>` +
           `${A.star(15, 15, 7.5, goldHi, .95)}</g>`;
    });
    // Pusula Gülü (Sol alt köşe)
    const kx = portrait ? 80 : 84, ky = portrait ? H - 84 : H - 80;
    g += `<g transform="translate(${kx} ${ky})" opacity=".95">` +
      `<circle r="42" fill="#071336" opacity=".68" stroke="${gold}" stroke-width="2"/>` +
      `<circle r="36" fill="none" stroke="${goldHi}" stroke-width="1" stroke-dasharray="2 4" opacity=".75"/>` +
      `<circle r="28" fill="none" stroke="${gold}" stroke-width=".9" opacity=".6"/>` +
      `<path d="M-26 -26L0 -5L26 -26L5 0L26 26L0 5L-26 26L-5 0Z" fill="#d8a444" opacity=".85"/>` +
      `<path d="M0 -40L7 -7L40 0L7 7L0 40L-7 7L-40 0L-7 -7Z" fill="${goldHi}"/>` +
      `<path d="M0 -40L7 -7L0 0Z M40 0L7 7L0 0Z M0 40L-7 7L0 0Z M-40 0L-7 -7L0 0Z" fill="#be8628"/>` +
      `<circle r="6" fill="#ff6e8e" stroke="${goldHi}" stroke-width="1.6"/><circle cx="-1.5" cy="-1.5" r="2" fill="#fff"/>` +
      `</g>`;

    g += `<rect width="${W}" height="${H}" fill="url(#hmVig)" pointer-events="none"/>`;
    const L0 = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" class="hm-L0" aria-hidden="true">${g}</svg>`;

    // ══ 2) HAREKETLİ BULUT VE DALGA KATMANLARI ══
    const cloud = (x, y, k, op, i) => box(x, y, 195 * k, 74 * k, cloudSvg(x, y, k, op), 'hm-cl', `animation-delay:${-i * 9}s;animation-duration:${50 + i * 7}s`);
    const L1 = cl.slice(0, 2).map((c, i) => cloud(...c, i)).join('');

    let wv = '';
    for (let r = 0; r < 2; r++) {
      let d = '';
      for (let k = 0; k < 7; k++) {
        const y0 = H * (.2 + k * .11 + r * .05);
        d += `M-60 ${f1(y0)}` + `q30 -9 60 0t60 0`.repeat(Math.ceil((W + 240) / 120));
      }
      wv += `<path class="hm-wv hm-wv${r}" d="${d}" fill="none" stroke="#c8ecff" stroke-width="1.8" stroke-linecap="round" opacity="${r ? .11 : .15}"/>`;
    }
    const LW = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" class="hm-L0 hm-Lw" aria-hidden="true">${wv}</svg>`;

    // ══ 3) BÜYÜK FENER IŞIK HÜZMELERİ (Cam yüzleri kapatmayan, çok katmanlı yumuşak tüylü hüzmeler) ══
    const bl = 230, bo = (.28 + .48 * K).toFixed(2), NB = 8;
    let wd = '';
    for (let k = 0; k < NB; k++) {
      const ang = f1(k * 180 / NB);
      const ray = (w1, w2, op) => `<path d="M40 ${-w1}L${bl} ${-w2}Q${bl + 12} 0 ${bl} ${w2}L40 ${w1}ZM-40 ${-w1}L${-bl} ${-w2}Q${-bl - 12} 0 ${-bl} ${w2}L-40 ${w1}Z" fill="url(#hmBm)" opacity="${op}"/>`;
      wd += `<g transform="rotate(${ang})" opacity="0">${ray(4, 24, .22)}${ray(2.5, 14, .32)}${ray(1.2, 6, .42)}<animate attributeName="opacity" values=".18;.95;.18" dur="${6 + (k % 3) * 1.5}s" begin="${-k * 1.1}s" repeatCount="indefinite"/></g>`;
    }
    const L2 = box(lamp.x, lamp.y, 2 * bl + 28, 2 * bl + 28,
      `<defs><radialGradient id="hmBm" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${bl}">` +
      `<stop offset="0%" stop-color="#fff8c8" stop-opacity="0"/>` +
      `<stop offset="17%" stop-color="#fff8c8" stop-opacity="0"/>` +
      `<stop offset="28%" stop-color="#fff4b8" stop-opacity=".75"/>` +
      `<stop offset="62%" stop-color="#ffe47a" stop-opacity=".22"/>` +
      `<stop offset="95%" stop-color="#ffd868" stop-opacity="0"/>` +
      `<stop offset="100%" stop-color="#ffd868" stop-opacity="0"/>` +
      `</radialGradient></defs><g transform="translate(${lamp.x} ${lamp.y})" opacity="${bo}"><g class="hm-spin" style="animation-duration:36s">${wd}</g></g>`
    );

    // ══ 4) CANLI PARÇACIKLAR VE KARAKTER İŞARETÇİLERİ ══
    let v = '';
    for (let i = 0; i < 6; i++) {
      const x = R() * W, y = R() * H;
      if (near(x, y)) continue;
      v += box(x, y, 26, 26, `<g transform="translate(${f1(x)} ${f1(y)})"><g class="hm-tw" style="animation-delay:${f1(-R() * 4)}s">${A.sparkle(0, 0, 3.5 + R() * 3)}</g></g>`);
    }
    // Fenerin etrafında dönen renkli yıldız kıvılcımları (yanan yüzlerin renginde)
    let sp = '';
    litArr.forEach((l, i) => {
      if (!l) return;
      const c = dy[i].renk, a = i / 9 * Math.PI * 2;
      sp += `<g><animateMotion dur="${9 + i}s" repeatCount="indefinite" begin="${-i}s" path="M${f1(lamp.x)} ${f1(lamp.y)}m${f1(Math.cos(a) * 44)} ${f1(Math.sin(a) * 18)}a${f1(76 + i * 3)} ${f1(32 + i * 2)} 0 1 1 1 0z"/><circle r="5.5" fill="${c}" opacity=".35"/><circle r="3" fill="${c}"/><circle r="1.4" fill="#fff"/></g>`;
    });
    if (sp) v += box(lamp.x, lamp.y, 320, 165, sp);
    v += ovs.join('');

    // Yüzen dilek fenerleri
    for (let i = 0; i < 4; i++) {
      const x = portrait ? 60 + R() * 580 : 50 + R() * 900, y = portrait ? 700 + R() * 260 : 450 + R() * 220;
      if (near(x, y)) continue;
      v += box(x + 4, y - 20, 52, 92, `<g transform="translate(${f1(x)} ${f1(y)})"><g><animateTransform attributeName="transform" type="translate" values="0 0;8 -${30 + i * 4};0 0" dur="${8 + i}s" repeatCount="indefinite"/>${A.glow(0, 0, 18, 18, 'o', .75)}<rect x="-4.5" y="-5.5" width="9" height="11" rx="3" fill="#ffad3a"/><rect x="-2.5" y="-3.5" width="5" height="6" rx="2" fill="#fff6c8"/></g></g>`);
    }

    // Kuş sürüsü
    const bird = (dx, dy, d) => `<path d="M${dx - 7} ${dy}Q${dx - 3.5} ${dy - 6} ${dx} ${dy}Q${dx + 3.5} ${dy - 6} ${dx + 7} ${dy}" fill="none" stroke="#fff4dc" stroke-width="2" stroke-linecap="round"><animate attributeName="d" dur=".9s" begin="${d}s" repeatCount="indefinite" values="M${dx - 7} ${dy}Q${dx - 3.5} ${dy - 6} ${dx} ${dy}Q${dx + 3.5} ${dy - 6} ${dx + 7} ${dy};M${dx - 7} ${dy - 4}Q${dx - 3.5} ${dy + 1} ${dx} ${dy}Q${dx + 3.5} ${dy + 1} ${dx + 7} ${dy - 4};M${dx - 7} ${dy}Q${dx - 3.5} ${dy - 6} ${dx} ${dy}Q${dx + 3.5} ${dy - 6} ${dx + 7} ${dy}"/></path>`;
    const flock = (path, dur, begin) => `<g opacity=".88"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${path}"/>${bird(0, 0, 0)}${bird(-16, 8, .2)}${bird(14, 9, .4)}</g>`;
    v += portrait ? box(W / 2, 330, W + 80, 260, flock('M-30 220C150 150 400 260 740 120', 38, -6))
                  : box(W / 2, 250, W + 80, 260, flock('M-30 200C250 120 600 260 1040 110', 40, -8));

    // Kenarlarda parıldayan yıldızlar
    for (let i = 0; i < 8; i++) {
      const x = 40 + R() * (W - 80), y = 40 + R() * (H - 80);
      if (near(x, y)) continue;
      v += box(x, y, 32, 32, `<g transform="translate(${f1(x)} ${f1(y)})"><g class="hm-tw" style="animation-delay:${f1(-R() * 4)}s">${A.sparkle(0, 0, 5 + R() * 4, '#fff2b0')}</g></g>`);
    }

    // Yelkenli tekneler
    const boat = (x, y, k, dur) => box(x + 60, y - 10, 180, 74,
      `<g transform="translate(${x} ${y}) scale(${k})"><g><animateMotion dur="${dur}s" repeatCount="indefinite" path="M0 0q30 -8 60 0t60 0t-60 6t-60 -6z"/>` +
      `<path d="M-14 0H14L9 7.5H-9Z" fill="#b06238" stroke="#f6d298" stroke-width="1"/>` +
      `<path d="M0 -3V-32L15 -6Z" fill="#fff8e6"/><path d="M-1.5 -3V-27L-13 -6Z" fill="#ffdca0"/>` +
      `<path d="M0 -32l7 2.5-7 2.5Z" fill="#ff7888"/>` +
      `<path d="M-18 8.5q18 -4 36 0" stroke="#eafaff" stroke-width="1.8" fill="none" opacity=".7"/>` +
      `</g></g>`);
    v += portrait ? boat(60, 640, 1, 20) + boat(430, 900, .9, 24) : boat(330, 642, 1, 20) + boat(780, 620, .9, 26);

    // Uçan ejderha silueti (üst şerit)
    const drg = (path, dur, k, d) => `<g><animateMotion dur="${dur}s" begin="${d}s" repeatCount="indefinite" path="${path}" rotate="auto"/><g transform="scale(${k})" opacity=".82"><path d="M-14 0Q-5 -3 5 0L18 -3L10 2L20 6L7 4Q0 7 -7 4L-18 7L-10 2Z" fill="#24224c"/><path d="M-4 -1L-1 -13L5 -2Z" fill="#363468"><animate attributeName="d" dur=".6s" repeatCount="indefinite" values="M-4 -1L-1 -13L5 -2Z;M-4 0L-1 7L5 0Z;M-4 -1L-1 -13L5 -2Z"/></path></g></g>`;
    v += box(W / 2, 80, W + 100, 120, portrait ? drg('M-40 120C200 60 500 160 760 90', 30, 1.2, 0) : drg('M-40 70C250 20 700 120 1040 50', 32, 1.2, -4));

    // Bütün ışıklar yandığında Büyük Fener'in Taç Şöleni (yumuşak radyal geçişli taç ışınları)
    if (done[ids[9]]) {
      const cyCrown = f1(B - 286 * fsc);
      let cel = `<defs>${A.defs()}<radialGradient id="hmCelG" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="145"><stop offset="0%" stop-color="#fffbe0" stop-opacity=".85"/><stop offset="45%" stop-color="#ffe888" stop-opacity=".35"/><stop offset="92%" stop-color="#ffd25a" stop-opacity="0"/><stop offset="100%" stop-color="#ffd25a" stop-opacity="0"/></radialGradient></defs>`;
      cel += `<g transform="translate(${lamp.x} ${cyCrown})"><g class="hm-spin" style="animation-duration:22s">${[...Array(12).keys()].map(k => `<path d="M0 0L-6 -140Q0 -148 6 -140Z" fill="url(#hmCelG)" opacity="${k % 2 ? .45 : .75}" transform="rotate(${k * 30})"/>`).join('')}</g>${A.glow(0, 0, 155, 155, 'y', .6)}${A.glow(0, 0, 75, 75, 'wt', .7)}</g>`;
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * 6.28;
        cel += `<g transform="translate(${f1(lamp.x + Math.cos(a) * 116)} ${f1(lamp.y + Math.sin(a) * 74)})"><g class="hm-tw" style="animation-delay:${f1(-i * .3)}s">${A.sparkle(0, 0, 5.5 + i % 3 * 2, '#fff4b8')}</g></g>`;
      }
      v += box(lamp.x, lamp.y - 42, 360, 350, cel);
    }

    // Sıradaki diyar: çift altın nabız halkası + Feza'nın Kraliyet Güneş Madalyonu
    const head = (x, y, pir) => (pir ? o.pirilImg : o.fezaImg)
      ? `<g transform="translate(${x} ${y})"><circle r="21" fill="#fff"/><image href="${pir ? o.pirilImg : o.fezaImg}" x="-19" y="-19" width="38" height="38"/></g>`
      : pir
        ? `<g transform="translate(${x} ${y})"><path d="M-12 -8L-9 -20L-3 -10M3 -10L9 -20L12 -8" fill="#a6d65a"/><ellipse rx="15" ry="12.5" fill="#b184e2" stroke="#fff" stroke-width="2"/><circle cx="-5.5" cy="-1" r="2" fill="#3b2a52"/><circle cx="5.5" cy="-1" r="2" fill="#3b2a52"/><path d="M-3 4Q0 7 3 4" stroke="#6a3f6e" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`
        : `<g transform="translate(${x} ${y})"><circle r="15" fill="#ffd6aa" stroke="#fff" stroke-width="2"/><path d="M-15 -2Q-17 -17 -2 -17Q15 -19 15 -2L9 -9L1 -6L-3 -11L-10 -6Z" fill="#8c542d"/><circle cx="-5" cy="1" r="2" fill="#332843"/><circle cx="5" cy="1" r="2" fill="#332843"/><path d="M-3 7Q0 10 3 7" stroke="#a15b53" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`;

    const ni = ids.indexOf(o.next);
    if (ni >= 0) {
      const p = ni < 9 ? pos[ni] : { x: cx, y: B - 250 * fsc }, k = ni < 9 ? sc : fsc, top = ni < 9 ? p.y - 114 * k : p.y - 62;
      v += box(p.x, p.y - 60 * k, 250 * k, 200 * k,
        `<defs>${A.defs()}</defs>` +
        `<ellipse cx="${p.x}" cy="${p.y - 4}" rx="${92 * k}" ry="${40 * k}" fill="none" stroke="#ffe47a" stroke-width="3.5" opacity=".92"><animate attributeName="rx" values="${70 * k};${114 * k}" dur="2s" repeatCount="indefinite"/><animate attributeName="ry" values="${28 * k};${50 * k}" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".95;0" dur="2s" repeatCount="indefinite"/></ellipse>` +
        `<ellipse cx="${p.x}" cy="${p.y - 4}" rx="${92 * k}" ry="${40 * k}" fill="none" stroke="#fff6cf" stroke-width="2.2" opacity=".8"><animate attributeName="rx" values="${70 * k};${114 * k}" dur="2s" begin="-1s" repeatCount="indefinite"/><animate attributeName="ry" values="${28 * k};${50 * k}" dur="2s" begin="-1s" repeatCount="indefinite"/><animate attributeName="opacity" values=".85;0" dur="2s" begin="-1s" repeatCount="indefinite"/></ellipse>` +
        `<g transform="translate(${p.x} ${top})"><g class="hm-pir">` +
        `${A.glow(0, 0, 52, 52, 'y', .78)}` +
        `<path d="M-11 17L0 34L11 17Z" fill="#ffd452" stroke="#fff6d0" stroke-width="2"/>` +
        `<circle r="26" fill="#ffd452" stroke="#fff8dc" stroke-width="2.5"/>` +
        `<circle r="22.5" fill="#ffffff"/>` +
        `${head(0, 0, false)}</g></g>`
      );
    }

    // Pırıl yol gösteriyor: son açılan altın patikada uçar
    const wings = `<ellipse cx="-17" cy="-2" rx="11" ry="5" fill="#d8f0ff" opacity=".88" transform="rotate(-25 -17 -2)"></ellipse><ellipse cx="17" cy="-2" rx="11" ry="5" fill="#d8f0ff" opacity=".88" transform="rotate(25 17 -2)"></ellipse>`;
    const guide = `<g>${wings}<g class="hm-pir">${A.glow(0, 0, 38, 38, 'p', .65)}${head(0, 0, true).replace('r="21"', 'r="17"')}</g></g>`;
    if (ni >= 0) {
      const a = nodes[ni], b = nodes[ni + 1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, bw = Math.abs(a.x - b.x) + 160, bh = Math.abs(a.y - b.y) + 160;
      v += box(mx, my, bw, bh, `<defs>${A.defs()}</defs><g opacity="0"><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.88;1" dur="7s" repeatCount="indefinite"/><animateMotion dur="7s" repeatCount="indefinite" path="${seg(ni)}" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".4 0 .6 1"/>${guide}</g>`);
    } else {
      v += box(lamp.x, lamp.y, 260, 150, `<defs>${A.defs()}</defs><g><animateMotion dur="14s" repeatCount="indefinite" path="M${lamp.x - 90} ${lamp.y}a90 40 0 1 1 180 0a90 40 0 1 1 -180 0z"/>${guide}</g>`);
    }

    return { svg: L0 + LW + L1 + L2 + v, vb: [W, H], pos };
  }
  return { render };
})();
