/* PERF1 — motor düzeyinde performans yardımcıları (tüm bölümler için ortak). Görüntüyü DEĞİŞTİRMEZ.
   1) Gizli (visible=false) alt ağaçların dünya matrisleri her karede hesaplanmaz (sahnenin ~%35'i gizli havuzlar).
      Görünür olduğu karede zaten güncellenir. `?perf=0` ile kapatılır.
   2) Durağan bölüm meshlerinde (decor-*, zemin-*, ağaç/kaya instanced) gereksiz yerel matris hesabı (updateMatrix) dondurulur
      ve kamera hedefinden (CAM.target) tamamen ekran dışında kalan uzak zemin/dekor parçaları (boundingSphere mesafesiyle) elenir.
   3) Gölge haritası uyarlamalı yarım hız: kare süresi bütçeyi aşarsa gölge haritası iki karede bir çizilir
      (gölge matrisi + harita birlikte eski kalır → duran nesnelerin gölgesi doğru; yalnız hareket edenin gölgesi 1 kare gecikir).
      Hızlı cihazda hiç devreye girmez. `?golge=yari` zorla açar, `?golge=tam` hiç açmaz.
   4) PRF.rapor() → {calls, tris, meshes, gorunen, progs}; PRF.butce = hedefler; PRF.kontrol(ad) bütçeyi aşanı konsola yazar.
      `?perfrapor` → bölüm yüklendikten ~3 sn sonra konsola otomatik yazar. */
const PRF = (() => {
  const off = Q.get('perf') === '0';
  const S = { gHalf: Q.get('golge') === 'yari', gMode: Q.get('golge'), n: 0, ema: 0, emaDt: 16.7, bad: 0, last: 0, tablet: QUALITY.tablet,
    butce: { calls: 150, tris: 400000 }, matSkip: !off, enabled: !off, _cullGrp: null, _cullList: [], _cullCnt: 0 };

  // ── 1) Gizli alt ağaçları atlayan matris güncelleyici (Object3D.updateMatrixWorld ile aynı mantık) ──
  const PROTO = THREE.Object3D.prototype.updateMatrixWorld;
  function walk(o, force) {
    if (o.matrixAutoUpdate) o.updateMatrix();
    if (o.matrixWorldNeedsUpdate || force) {
      if (o.parent === null) o.matrixWorld.copy(o.matrix); else o.matrixWorld.multiplyMatrices(o.parent.matrixWorld, o.matrix);
      o.matrixWorldNeedsUpdate = false; force = true;
    }
    const ch = o.children;
    for (let i = 0, n = ch.length; i < n; i++) {
      const c = ch[i];
      if (c.visible === false || c.matrixWorldAutoUpdate === false) continue;
      if (c.updateMatrixWorld !== PROTO) c.updateMatrixWorld(force); else walk(c, force);   // SkinnedMesh/Camera… kendi sürümünü korur
    }
  }
  if (S.matSkip) scene.updateMatrixWorld = function (force) { walk(this, force); };

  // ── 1b) Durağan bölüm parçalarında matris dondurma + ekran dışı mesafe budaması (frustum/distance culling) ──
  const RE_STATIC = /^(decor-|zemin-|oak$|pine$|blossom$|lolli$|bush$|rock$|sus610-)|-zemin$/;
  const RE_CULL = /^(decor-(glow|decor|shinyNS|shiny)|zemin-)/;
  function syncLevelCull() {
    if (off || typeof GAME === 'undefined' || !GAME || !GAME.L || !GAME.L.group || typeof CAM === 'undefined' || !CAM.target) return;
    const grp = GAME.L.group;
    // DEKOR_BOL ilk karelerde parça ekleyebildiği için çocuk sayısı değiştiğinde listeyi yenile
    if (S._cullGrp !== grp || S._cullCnt !== grp.children.length) {
      S._cullGrp = grp; S._cullCnt = grp.children.length; S._cullList.length = 0;
      grp.traverse(o => {
        if (!o.isMesh) return;
        const nm = o.name || '';
        if (RE_STATIC.test(nm) && !o.isInstancedMesh && o.matrixAutoUpdate) {
          o.updateMatrix(); o.matrixWorldNeedsUpdate = true; o.matrixAutoUpdate = false;
        }
        if (RE_CULL.test(nm) && o.geometry) {
          if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
          const bs = o.geometry.boundingSphere;
          if (bs && Number.isFinite(bs.radius) && bs.radius < 65) {
            const isZ = nm.startsWith('zemin-') || nm === 'decor-decor';
            S._cullList.push({ o, cx: bs.center.x + o.position.x, cz: bs.center.z + o.position.z, r: bs.radius, maxD: isZ ? 22 : 30 });
          }
        }
      });
    }
    const warm = !!(GAME.loading || scene.getObjectByName('gameWarm'));
    const tx = CAM.target.x, tz = CAM.target.z, list = S._cullList;
    for (let i = 0, n = list.length; i < n; i++) {
      const it = list[i];
      if (warm) { it.o.visible = true; continue; }
      const d = Math.hypot(it.cx - tx, it.cz - tz) - it.r;
      it.o.visible = d <= it.maxD;
    }
  }

  // ── 2) Gölge haritası uyarlamalı yarım hız ──
  const sm = renderer.shadowMap, rf0 = renderFrame;
  renderFrame = function () {
    const t0 = performance.now();
    syncLevelCull();
    let skip = false;
    if (S.gHalf && S.gMode !== 'tam' && !(typeof GAME !== 'undefined' && GAME && GAME.loading)) { sm.autoUpdate = false; sm.needsUpdate = ((S.n++) & 1) === 0; skip = true; }
    try { rf0(); } finally { if (skip) sm.autoUpdate = true; }
    // bütçe izleme: yalnız oyun sırasında (menü/yükleme kareleri sayılmaz)
    const dt = performance.now() - t0, now = t0;
    if (S.last && now - S.last < 100) {
      S.ema += (dt - S.ema) * 0.05; S.emaDt += ((now - S.last) - S.emaDt) * 0.05;
      if (!S.gHalf && S.gMode !== 'tam' && S.tablet) {
        // ölçütler: çizim CPU süresi > 5.5 ms (≈ bu bilgisayarın 2.7 katı yavaşı) YA DA kareler kaçıyor (> 19 ms)
        if (S.ema > 5.5 || S.emaDt > 19) { if (++S.bad > 90) { S.gHalf = true; S.ema = 0; if (DEBUG) console.log('[PRF] gölge yarım hız'); } } else S.bad = Math.max(0, S.bad - 1);
      }
    }
    S.last = now;
  };

  // ── 3) Bütçe raporu ──
  function rapor() {
    syncLevelCull();
    const info = renderer.info, ar = info.autoReset, rt = renderer.getRenderTarget();
    info.autoReset = false; info.reset();
    renderer.setRenderTarget(typeof POST !== 'undefined' && POST.on && rtMain ? rtMain : null);
    sm.needsUpdate = true; const au = sm.autoUpdate; sm.autoUpdate = true;
    renderer.render(scene, camera);
    const r = { calls: info.render.calls, tris: info.render.triangles, progs: info.programs ? info.programs.length : 0, geo: info.memory.geometries, tex: info.memory.textures };
    sm.autoUpdate = au; info.autoReset = ar; renderer.setRenderTarget(rt);
    let meshes = 0, gorunen = 0;
    const w = (o, h) => { if (o.isMesh || o.isPoints || o.isLine || o.isSprite) { meshes++; if (!h) gorunen++; } for (const c of o.children) w(c, h || !c.visible); };
    w(scene, !scene.visible);
    r.meshes = meshes; r.gorunen = gorunen; r.gShadowHalf = S.gHalf; r.renderMs = +S.ema.toFixed(2);
    return r;
  }
  function kontrol(ad) {
    const r = rapor(), b = S.butce, kotu = [];
    if (r.calls > b.calls) kotu.push('çizim çağrısı ' + r.calls + ' > ' + b.calls);
    if (r.tris > b.tris) kotu.push('üçgen ' + r.tris + ' > ' + b.tris);
    (kotu.length ? console.warn : console.log)('[PRF] ' + (ad || '') + ' ' + JSON.stringify(r) + (kotu.length ? ' BÜTÇE AŞILDI: ' + kotu.join('; ') : ''));
    return r;
  }
  if (Q.has('perfrapor')) {
    let lastZone = null;
    setInterval(() => { try { const z = typeof GAME !== 'undefined' && GAME && GAME.P ? GAME.P.zone : null; if (z !== null && z !== lastZone && GAME.state === 'play' && !GAME.loading) { lastZone = z; setTimeout(() => kontrol('bölüm ' + z), 3000); } } catch (e) { /* yok */ } }, 1000);
  }
  return { S, rapor, kontrol, get butce() { return S.butce; }, set butce(v) { S.butce = v; }, get golgeYari() { return S.gHalf; }, set golgeYari(v) { S.gHalf = !!v; } };
})();
