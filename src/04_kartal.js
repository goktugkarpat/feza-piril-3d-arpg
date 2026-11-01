/* Dağ Kartalı: dost, kanatları tüylü; BABA.builder ile aynı yapı. KARTAL.model() → { root, update(dt, {dive, flap, bank, carry, perch, fold}), dispose }. */
'use strict';
const KARTAL = (() => {
  const TAU2=Math.PI*2, sat=x=>Math.max(0,Math.min(1,x));
  const builder = BABA.builder;
  function eagle() {
    const b=builder('Friendly forest eagle'),{root,joint,ell,dot,tube,cloth,soft,gloss,feather}=b;
    const body=joint(root,'eagle body'),neck=joint(body,'eagle neck',0,.18,.24),head=joint(neck,'eagle head',0,.12,.13),tail=joint(body,'eagle tail',0,-.025,-.33);
    ell(body,0x79523c,[0,0,0],[.23,.27,.43]);ell(body,0xceac73,[0,-.09,.155],[.186,.17,.257]);
    for(let row=0;row<3;row++)for(let i=0;i<5;i++)ell(body,row%2?0xb59162:0xe0bf84,[(i-2)*.058,-.16+row*.069,.34-row*.046],[.053,.066,.027],cloth,[0,0,(i-2)*-.10]);
    ell(neck,0xf4e9d0,[0,.01,.055],[.195,.205,.185]);ell(head,0xfff5da,[0,0,.035],[.187,.176,.178]);
    for(const side of[-1,1]) {
      ell(head,0xe8d9b9,[side*.15,.02,.092],[.053,.077,.034]);dot(head,0x4b3823,[side*.151,.029,.123],[.032,.040,.019]);dot(head,0x191e1c,[side*.154,.030,.139],[.020,.026,.009]);dot(head,0xffffff,[side*.163,.043,.148],[.008,.010,.004]);
      tube(head,[[side*.10,.083,.124],[side*.15,.104,.105],[side*.19,.085,.066]],.011,0x836448);
    }
    ell(head,0xe9ac46,[0,-.047,.205],[.089,.072,.14]);ell(head,0xf1bf58,[0,-.099,.285],[.058,.077,.059],soft,[.42,0,0]);
    tube(head,[[-.046,-.071,.260],[0,-.074,.31],[.046,-.071,.260]],.005,0x885b2e);
    const wings=[],tailFeathers=[],talons=[];
    for(const side of[-1,1]) {
      const shoulder=joint(body,'eagle shoulder '+side,side*.16,.055,-.018),wrist=joint(shoulder,'eagle wrist '+side,side*.40,0,-.07);
      ell(shoulder,0x81573e,[side*.21,0,-.035],[.29,.052,.18],cloth,[0,side*.15,0]);ell(wrist,0x644433,[side*.20,0,-.063],[.29,.046,.165],cloth);
      for(let i=0;i<9;i++) {
        const u=i/8;feather(wrist,i%2?0x7f573e:0x5a4132,[side*(.10+.38*u),-.012,-.105],.052,.55-.15*u,side*(.12+.65*u));
        feather(shoulder,i%2?0xa47a50:0x976e49,[side*(.04+.39*u),.036,.025],.049,.24,side*.13);
      }
      for(let i=0;i<5;i++)feather(shoulder,0xb28a61,[side*(.03+i*.079),.061,.09],.047,.17,side*.12);

      wings.push({side,shoulder,wrist});
      const leg=joint(body,'eagle leg '+side,side*.12,-.21,-.035);talons.push(leg);ell(leg,0xbc995f,[0,-.055,.025],[.048,.10,.05]);
      for(let i=0;i<3;i++)tube(leg,[[0,-.12,.02],[(i-1)*.043,-.15,.06],[(i-1)*.05,-.145,.13],[(i-1)*.04,-.115,.15]],.012,0xd6a64b);
    }
    for(let i=0;i<7;i++){const f=joint(tail,'eagle tail feather '+i,(i-3)*.043,-.014,-.04);feather(f,i%2?0xd6c8a8:0x4f3b2e,[0,0,0],.048,.42,(i-3)*-.08);tailFeathers.push(f);}
    const out=b.finish();let joyK=0,curK=0,time=0,wingPhase=0,diveBlend=0,flapSpeed=4.6,bankBlend=0,neckFollow=0,carryBlend=0,perchBlend=0;
    out.update=(dt,state={})=>{dt=Math.max(0,Math.min(.1,dt));time+=dt;const blend=1-Math.exp(-12*dt),previousDive=diveBlend;diveBlend+=(sat(state.dive||0)-diveBlend)*blend;flapSpeed+=((state.flap||(state.fast?8.6:4.6))-flapSpeed)*blend;wingPhase+=dt*flapSpeed;
      const dive=diveBlend,beat=Math.sin(wingPhase),flap=(beat*.28+.12)*(1-dive*.72)*(1-.93*perchBlend),recovery=sat((previousDive-dive)*18),bankTarget=Math.max(-.16,Math.min(.16,state.bank||0));bankBlend+=(bankTarget-bankBlend)*(1-Math.exp(-7*dt));neckFollow+=(dive-neckFollow)*(1-Math.exp(-8*dt));carryBlend+=(sat(state.carry||0)-carryBlend)*(1-Math.exp(-6*dt));perchBlend+=(sat(state.perch||0)-perchBlend)*(1-Math.exp(-6*dt));const fold=perchBlend;
      body.rotation.set(-.17*dive+.024*Math.sin(time*2.1)+.028*beat*(1-dive)-.42*perchBlend,bankBlend*.20,bankBlend+.012*Math.sin(wingPhase-.35)*(1-dive));
      neck.rotation.set(-.13*neckFollow,.022*Math.sin(time*.9)*(1-dive),-bankBlend*.18);
      head.rotation.set(.51*dive-.075*recovery,.045*Math.sin(time*.8)*(1-dive)-bankBlend*.32,-bankBlend*.38);
      tail.rotation.set(.16*dive+.045*Math.sin(wingPhase-.85)*(1-dive)+.06*recovery,-bankBlend*.32,-bankBlend*.28);
      for(const wing of wings){const downstroke=Math.max(0,-Math.cos(wingPhase));wing.shoulder.rotation.set(.024*beat*(1-dive),wing.side*(.055*dive+.015*recovery+1.15*fold),wing.side*(-flap+.38*dive+.22*fold)-bankBlend*.18);
        // Wrists lag the shoulder through the upstroke; primaries flex rather than flap as a plank.
        wing.wrist.rotation.set(.045*Math.sin(wingPhase-.55)*(1-dive),wing.side*(-.13*dive+.045*downstroke*(1-dive)+1.2*fold),wing.side*((Math.sin(wingPhase-.38)*.28+.12)*.48*(1-dive*.72)+.19*dive));}
      for(let i=0;i<tailFeathers.length;i++){const f=tailFeathers[i],spread=.028+.075*(1-dive)+.028*recovery;f.rotation.set(.012*Math.sin(wingPhase-.5+i*.11)*(1-dive),(i-3)*spread,-bankBlend*.08);}
      for(let i=0;i<talons.length;i++){const t=talons[i];t.rotation.set(-.24+.76*dive+.62*carryBlend+.30*perchBlend-.06*recovery+.014*Math.sin(wingPhase+i*Math.PI)*(1-dive),0,(i===0?-1:1)*.020*(1-dive));}
      // G5 duygular: joy (sevinç: kanatlar hızlı çırpar, başı sağa sola, kuyruk yelpaze), merak (başı yana eğer)
      joyK+=(sat(state.joy||0)-joyK)*blend;curK+=(sat(state.merak||0)-curK)*blend;
      if(joyK>.01){wingPhase+=dt*5*joyK;head.rotation.z+=.28*joyK*Math.sin(time*7);head.rotation.y+=.2*joyK*Math.sin(time*5.3);body.rotation.x+=.05*joyK*Math.sin(time*7);for(const f of tailFeathers)f.rotation.y*=1+.5*joyK;}
      if(curK>.01){head.rotation.z+=.45*curK;head.rotation.x-=.08*curK;}
      root.updateMatrixWorld(true);
    };out.update(0);return out;
  }
  return {eagle, model: eagle};
})();

/* ── KARTAL yoldaşı: Feza'nın üstünde gökte yavaş daire çizer, ara sıra selam verir (kanat eğip alçalır);
   otomatik yardım: huysuzları geri iter (ZARAR YOK). Bekleme 30 sn, can<%50 veya ≥4 düşman (B9–B10 eşik %35).
   KARTAL.kur({ scene, hero: () => P, enemies: () => [...], it: (e, dx, dz, mesafe) => {}, sersemlet?, sfx })
   → k: { root, model, pos, update(dt), selam(), itHuysuz(), dispose() }  — uçtuğu için engele takılmaz; gölge yok (yer gölgesi motorda). */
(() => {
  'use strict';
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const IT = { yaricap: 6, mesafe: 2.6, dur: .5, bekleme: 30, canEsik: .5, canEsikB9: .35, dusman: 4 };
  let cur = null;
  const ang = (a, b, k, dt) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * (1 - Math.exp(-k * dt));
  function kur(env) {
    if (cur) cur.dispose();
    const model = KARTAL.model(), root = model.root; root.scale.setScalar(1.15); if (env.scene) env.scene.add(root);
    const pos = { x: 0, y: 4.6, z: 0 }; let t = 0, face = 0, started = false, act = null, prev = { x: 0, z: 0 }, bank = 0, pushes = [];
    const hp = () => { const h = env.hero(); return h.pos || h; };
    function update(dt) {
      dt = Math.min(.05, Math.max(0, dt)); t += dt; const p = hp();
      if (!started) { pos.x = p.x + 3; pos.z = p.z; pos.y = 4.6; started = true; prev.x = pos.x; prev.z = pos.z; }
      let dive = 0, fast = false, goal;
      const cx = p.x, cz = p.z, w = t * .55, R = 3.4;   // Feza'nın üstünde yavaş daire
      goal = { x: cx + Math.cos(w) * R, y: 4.6 + Math.sin(t * .9) * .25, z: cz + Math.sin(w) * R };
      if (act) {
        act.age += dt;
        if (act.k === 'selam') {   // Feza'nın yanına alçal, kanat eğ, geri yüksel
          const u = Math.min(1, act.age / 2.6), s = Math.sin(Math.PI * u);
          goal = { x: cx + Math.cos(w) * (R - 1.4 * s), y: 4.6 - 2.9 * s, z: cz + Math.sin(w) * (R - 1.4 * s) }; dive = .0; fast = false;
          if (u >= 1) act = null;
        } else if (act.k === 'it') {
          const u = Math.min(1, act.age / .9); dive = Math.sin(Math.PI * u); fast = true;
          goal = { x: act.cx, y: 4.6 - 3.6 * dive, z: act.cz };
          if (u >= .5 && !act.done) { act.done = true; for (const e of act.list) pushes.push({ e, age: 0, dx: act.dirs.get(e)[0], dz: act.dirs.get(e)[1], moved: 0 }); if (env.sfx) env.sfx('wingGust', { vol: .8 }); }
          if (u >= 1) act = null;
        }
      }
      const k = 1 - Math.exp(-(act && act.k === 'it' ? 9 : 3.2) * dt);
      const ox = pos.x, oz = pos.z;
      pos.x += (goal.x - pos.x) * k; pos.z += (goal.z - pos.z) * k; pos.y += (goal.y - pos.y) * k;
      const vx = (pos.x - ox) / (dt || 1), vz = (pos.z - oz) / (dt || 1), sp = Math.hypot(vx, vz);
      if (sp > .3) face = ang(face, Math.atan2(vx, vz), 5, dt);
      const turn = Math.atan2(Math.sin(Math.atan2(vx, vz) - face), Math.cos(Math.atan2(vx, vz) - face));
      bank += (Math.max(-.16, Math.min(.16, turn * -.5)) + (act && act.k === 'selam' ? .16 * Math.sin(Math.PI * Math.min(1, act.age / 2.6)) : 0) - bank) * Math.min(1, 4 * dt);
      root.position.set(pos.x, pos.y, pos.z); root.rotation.y = face;
      jT = Math.max(0, jT - dt);
      model.update(dt, { dive, fast, bank, flap: act && act.k === 'selam' ? 3.2 : undefined, joy: jT > 0 && jAd === 'joy' ? 1 : 0, merak: jT > 0 && jAd === 'merak' ? 1 : 0 });
      for (const q of pushes) {   // geri it: düşman .5 sn'de mesafe kadar kayar (zarar yok)
        q.age += dt; const u = Math.min(1, q.age / IT.dur), step = (1 - Math.pow(1 - u, 2)) * IT.mesafe - q.moved; q.moved += step;
        if (q.e && !q.e.dead && env.it) env.it(q.e, q.dx * step, q.dz * step, step);
      }
      pushes = pushes.filter(q => q.age < IT.dur);
    }
    let jAd = null, jT = 0;
    function jest(ad, sn = 2.5) { jAd = ad; jT = sn; return true; }
    function selam() { if (act) return false; act = { k: 'selam', age: 0 }; return true; }
    function itHuysuz() {
      if (act && act.k === 'it') return 0; const p = hp(), list = [], dirs = new Map(); let sx = 0, sz = 0;
      for (const e of (env.enemies ? env.enemies() : [])) {
        if (!e || e.dead || dist(e, p) > IT.yaricap) continue;
        const dx = e.x - p.x, dz = e.z - p.z, d = Math.hypot(dx, dz) || 1; list.push(e); dirs.set(e, [dx / d, dz / d]); sx += e.x; sz += e.z;
      }
      if (!list.length) return 0; act = { k: 'it', age: 0, cx: sx / list.length, cz: sz / list.length, list, dirs, done: false }; return list.length;
    }
    function dispose() { if (root.parent) root.parent.remove(root); model.dispose(); if (cur === api) cur = null; }
    const api = { jest, root, model, pos, update, selam, itHuysuz, dispose, get mesgul() { return !!act; } };
    cur = api; KARTAL.jest = (ad, sn) => (cur ? cur.jest(ad, sn) : false); return api;
  }
  const kayit = {
    id: 'kartal', ad: 'Kartal geri itme', bekleme: IT.bekleme, canEsik: IT.canEsik, dusman: IT.dusman, b9: { canEsik: IT.canEsikB9 },
    tetik(ctx) { return ctx.canOrani < (ctx.bolum >= 9 ? IT.canEsikB9 : IT.canEsik) || ctx.yakinDusman >= IT.dusman; },
    eylem() { return cur ? cur.itHuysuz() : 0; }, hazir() { return !!cur && !cur.mesgul; },
  };
  Object.assign(KARTAL, { kur, kayit, IT, get aktif() { return cur; } });
})();
