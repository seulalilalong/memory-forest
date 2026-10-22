
(() => {
  const qs = new URLSearchParams(location.search);
  const SCRIPT = document.currentScript;
  const NAME = qs.get("set") || SCRIPT?.dataset.set || "frames-forest";
  const SET = (SCRIPT?.dataset.base || "") + NAME;
  
  const CFG = Object.assign({ bird: true, fx: NAME.includes("forest"), doodle: NAME.includes("sketch"), glow: false, frames: [0.28, 0.86], title: [0.84, 0.96] },
    NAME.includes("popup") ? { bird: false, glow: true, frames: [0.03, 0.84], title: [0.84, 0.96] } : {});
  const FIX = qs.has("p") ? parseFloat(qs.get("p")) : null;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches && !qs.has("motion");
  const DEBUG = qs.has("debug");

  const $ = (s, r = document) => r.querySelector(s);
  const hero = $("#hero"), back = $(".cv-back"), front = $(".cv-front");
  const bctx = back.getContext("2d"), fctx = front.getContext("2d");
  const bird = $(".bird"), sheet = $(".sheet", bird), crane = $(".crane", bird);
  const wingN = $(".wing-near", bird), wingF = $(".wing-far", bird);
  const hint = $(".hint"), title = $(".title"), bar = $(".progress i"), loading = $(".loading");

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lin = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
  const ss = (a, b, v) => { const t = lin(a, b, v); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;

  
  const START = [0.62, 0.598];
  const HOP_END = [0.55, 0.598];
  const CLOCK = [0.30, 0.13], RAD = [0.065, 0.075];
  const pts = [HOP_END, [0.47, 0.42], [0.39, 0.25]];
  for (let k = 0; k <= 10; k++) {
    const a = -0.5 + (k / 10) * Math.PI * 2;
    pts.push([CLOCK[0] + RAD[0] * Math.cos(a), CLOCK[1] - RAD[1] * Math.sin(a)]);
  }
  pts.push([0.44, 0.17], [0.6, 0.26], [0.76, 0.31], [0.88, 0.25], [0.99, 0.12]);
  const path = buildPath(pts, 600);

  function buildPath(P, n) {
    const cr = (p0, p1, p2, p3, t) => {
      const t2 = t * t, t3 = t2 * t;
      return [0, 1].map(i => 0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3));
    };
    const raw = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < 40; k++) raw.push(cr(p0, p1, p2, p3, k / 40));
    }
    raw.push(P[P.length - 1]);
    const L = [0];
    for (let i = 1; i < raw.length; i++) {
      const dx = (raw[i][0] - raw[i - 1][0]) * 16, dy = (raw[i][1] - raw[i - 1][1]) * 9;
      L.push(L[i - 1] + Math.hypot(dx, dy));
    }
    const out = [];
    for (let k = 0; k <= n; k++) {
      const want = (k / n) * L[L.length - 1];
      let j = 1; while (j < L.length - 1 && L[j] < want) j++;
      const f = (want - L[j - 1]) / Math.max(1e-6, L[j] - L[j - 1]);
      out.push([lerp(raw[j - 1][0], raw[j][0], f), lerp(raw[j - 1][1], raw[j][1], f)]);
    }
    return out;
  }
  const at = t => path[Math.round(clamp(t, 0, 1) * (path.length - 1))];

  
  const DOODLE = qs.has("doodle") ? qs.get("doodle") !== "0" : CFG.doodle;
  const dsvg = $(".doodles"), dg = $(".doodles g");
  const GREEN = "#3BA84A", ORANGE = "#F2952B", PINK = "#E2669F", YELLOW = "#F4CF34";
  const petals = (cx, cy, R, rot = 0) => Array.from({ length: 5 }, (_, k) => {
    const t = rot + k * Math.PI * 2 / 5, a = 0.55, q = R * 1.15;
    const P = (r, ang) => `${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`;
    return `M${cx},${cy} Q${P(q, t - a)} ${P(R, t)} Q${P(q, t + a)} ${cx},${cy}`;
  });
  const DOODLES = [
    ["M1255,505 C1248,455 1278,412 1262,352", GREEN, 18, 0.66, 0.76],
    ["M1262,445 c-24,-4 -38,-22 -34,-36 c16,4 30,18 34,36", GREEN, 14, 0.72, 0.78],
    ...petals(1262, 338, 26, -0.3).map((d, k) => [d, ORANGE, 14, 0.76 + k * 0.012, 0.8 + k * 0.012]),
    ["M1312,508 C1324,462 1298,424 1326,384", GREEN, 18, 0.7, 0.8],
    ...petals(1327, 372, 20, 0.4).map((d, k) => [d, PINK, 12, 0.8 + k * 0.01, 0.83 + k * 0.01]),
    ["M300,712 C278,650 342,612 306,560 C280,520 332,490 318,452", GREEN, 18, 0.72, 0.84],
    ["M312,600 c22,-6 36,-24 30,-38 c-16,6 -28,20 -30,38", GREEN, 14, 0.8, 0.85],
    ...petals(318, 440, 24, 0).map((d, k) => [d, YELLOW, 14, 0.84 + k * 0.01, 0.87 + k * 0.01]),
    ["M1452,70 L1452,122 M1426,96 L1478,96", YELLOW, 12, 0.9, 0.95],
    ["M1522,160 L1522,192 M1506,176 L1538,176", YELLOW, 10, 0.92, 0.97],
  ];
  const dpaths = [];
  if (DOODLE) {
    dsvg.classList.add("on");
    for (const [d, c, w, a0, a1] of DOODLES) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
      el.setAttribute("d", d); el.setAttribute("stroke", c); el.setAttribute("stroke-width", w);
      dg.appendChild(el);
      const L = el.getTotalLength();
      el.style.strokeDasharray = L; el.style.strokeDashoffset = L;
      dpaths.push({ el, L, a0, a1 });
    }
    for (const [cx, cy, c] of [[1262, 338, "#C9561B"], [1327, 372, "#B83F78"], [318, 440, "#D9A019"]]) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      el.setAttribute("cx", cx); el.setAttribute("cy", cy); el.setAttribute("r", 11); el.setAttribute("fill", c); el.style.opacity = 0;
      dg.appendChild(el); dpaths.push({ dot: el, a0: 0.83, a1: 0.9 });
    }
  }

  
  const FX = qs.has("fx") ? qs.get("fx") !== "0" : CFG.fx;
  const rays = $(".rays"), leafCv = $(".cv-leaves"), lctx = leafCv.getContext("2d");
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const LEAF_COLORS = ["#D9822B", "#C4562A", "#E6B23A", "#B9772F", "#8FA548", "#6E8F3E"];
  const MAPLE = new Path2D(), OVAL = new Path2D();
  [[-150, .46], [-120, .2], [-90, .52], [-60, .2], [-30, .46], [2, .18], [35, .32], [90, .1], [145, .32], [178, .18]]
    .forEach(([a, r], i) => { const x = r * Math.cos(a * Math.PI / 180), y = r * Math.sin(a * Math.PI / 180); i ? MAPLE.lineTo(x, y) : MAPLE.moveTo(x, y); });
  MAPLE.closePath();
  OVAL.moveTo(0, -0.5); OVAL.quadraticCurveTo(0.4, -0.1, 0, 0.5); OVAL.quadraticCurveTo(-0.4, -0.1, 0, -0.5);
  const leaves = [];
  const spawn = (l, anywhere) => Object.assign(l, {
    x: rnd() * 1.1 - 0.05, y: anywhere ? rnd() * 1.1 - 0.1 : -0.06 - rnd() * 0.12,
    s: 0.6 + rnd() * 0.75, vy: 0.04 + rnd() * 0.05, sw: 0.02 + rnd() * 0.035, sf: 0.7 + rnd() * 1.3, ph: rnd() * 6.28,
    rot: rnd() * 6.28, vr: (rnd() - 0.5) * 2.2, flip: rnd() * 6.28, vf: 1.4 + rnd() * 2.6,
    maple: rnd() < 0.6, c: LEAF_COLORS[(rnd() * LEAF_COLORS.length) | 0],
  });
  if (FX) {
    rays.classList.add("on"); leafCv.classList.add("on");
    for (let i = 0; i < 30; i++) leaves.push(Object.assign(spawn({}, true), { th: i / 30 }));
    for (let i = 0; i < 4; i++) leaves.push(Object.assign(spawn({}, true), { th: 0.2 + i * 0.2, near: true }));
    leaves.forEach(l => { if (l.near) { l.s = 2.2 + rnd() * 1.2; l.vy *= 2.2; } });
  }

  let leafT = 0;
  function drawLeaves(p, dt) {
    lctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    lctx.clearRect(0, 0, W, H);
    const dens = ss(0.5, 0.88, p) * (W < 640 ? 0.55 : 1);
    if (dens <= 0) return;
    leafT += dt;
    const gust = clamp(vel / 2500, -1.6, 1.6);
    const base = clamp(Math.min(W, H) * 0.04, 16, 40);
    for (const l of leaves) {
      l.y += l.vy * (1 + Math.abs(gust) * 0.8) * dt;
      l.x += (Math.cos(leafT * l.sf + l.ph) * l.sw - gust * (l.near ? 0.12 : 0.05)) * dt;
      l.rot += l.vr * dt * (1 + Math.abs(gust)); l.flip += l.vf * dt;
      if (l.y > 1.15) { const near = l.near, s = l.s, vy = l.vy; spawn(l, false); if (near) { l.s = s; l.vy = vy; l.y -= 0.1; } }
      if (l.x < -0.08) l.x += 1.16; else if (l.x > 1.08) l.x -= 1.16;
      const a = clamp((dens - l.th) * 6, 0, 1);
      if (!a) continue;
      const sz = base * l.s, fl = Math.cos(l.flip);
      lctx.save();
      lctx.globalAlpha = (l.near ? 0.8 : 0.95) * a;
      lctx.filter = l.near ? "blur(4px)" : "none";
      lctx.shadowColor = "rgba(60,30,5,.35)"; lctx.shadowBlur = l.near ? 0 : 6; lctx.shadowOffsetY = l.near ? 0 : 3;
      lctx.translate(l.x * W, l.y * H);
      lctx.rotate(l.rot);
      lctx.scale(sz * (Math.abs(fl) < 0.15 ? 0.15 * (fl < 0 ? -1 : 1) : fl), sz);
      lctx.fillStyle = l.c;
      lctx.fill(l.maple ? MAPLE : OVAL);
      lctx.shadowColor = "transparent";
      lctx.strokeStyle = "rgba(70,35,10,.45)"; lctx.lineWidth = 0.05;
      lctx.beginPath(); lctx.moveTo(0, l.maple ? 0.36 : 0.62); lctx.lineTo(0, l.maple ? -0.3 : -0.42); lctx.stroke();
      lctx.restore();
    }
  }

  const glows = CFG.glow ? $(".glows") : null;
  if (glows) glows.classList.add("on");

  
  let frames = [], count = 0, IW = 1280, IH = 720, loaded = 0;
  const SMALL = Math.min(innerWidth, innerHeight) < 700;
  const tryLoad = s => fetch(`${s}/manifest.json`).then(r => { if (!r.ok) throw new Error(s); return r.json().then(m => [s, m]); });
  (SMALL ? tryLoad(SET + "-m").catch(() => tryLoad(SET)) : tryLoad(SET)).then(([FSET, m]) => {
    count = m.count; IW = 1280; IH = 720;
    m.dir = FSET;
    const url = i => `${m.dir}/f_${String(i).padStart(m.pad || 3, "0")}.${m.ext || "webp"}`;
    const order = [], seen = new Set(), add = i => { if (!seen.has(i)) { seen.add(i); order.push(i); } };
    for (let i = 0; i < count; i += 8) add(i);
    add(count - 1);
    const firstPass = order.length;
    [4, 2, 1].forEach(st => { for (let i = 0; i < count; i += st) add(i); });
    let next = 0, flying = 0;
    const pump = () => { while (flying < 6 && next < order.length) { const i = order[next++]; flying++; frames[i].src = url(i); } };
    frames = Array.from({ length: count }, () => {
      const im = new Image();
      im.decoding = "async";
      const done = ok => { flying--; if (ok) { loaded++; loading.querySelector("b").textContent = Math.round(loaded / count * 100); dirty = true; }
                           if (loaded >= Math.min(firstPass, count)) loading.classList.add("done"); pump(); };
      im.onload = () => done(true); im.onerror = () => done(false);
      return im;
    });
    pump();
    resize();
  });

  function frameAt(i) {
    for (let k = i; k >= 0; k--) if (frames[k] && frames[k].complete && frames[k].naturalWidth) return frames[k];
    return null;
  }

  
  let W = 0, H = 0, DPR = 1, rect = { x: 0, y: 0, w: 0, h: 0 }, portrait = false, dirty = true, BW = 100, BH = 75;
  function resize() {
    W = innerWidth; H = innerHeight; DPR = Math.min(2, devicePixelRatio || 1);
    front.width = W * DPR; front.height = H * DPR;
    back.width = Math.max(1, W / 4); back.height = Math.max(1, H / 4);
    leafCv.width = W * DPR; leafCv.height = H * DPR;
    portrait = W / H < 1;
    const ar = IW / IH;
    if (portrait) {
      const h = Math.min(H * 0.72, W * 1.9 / ar * ar); rect.h = h; rect.w = h * ar; rect.y = (H - h) / 2;
    } else {
      const sCover = Math.max(W / IW, H / IH), sContain = Math.min(W / IW, H / IH);
      const s = (W / H > 1.4 && W / H < 2.2) ? sCover : sContain;
      rect.w = IW * s; rect.h = IH * s; rect.x = (W - rect.w) / 2; rect.y = (H - rect.h) / 2;
    }
    BW = clamp(rect.w * 0.09, 60, 150); BH = BW * 0.75;
    for (const el of [FX && rays, DOODLE && dsvg, glows]) if (el) { el.style.width = rect.w + "px"; el.style.height = rect.h + "px"; }
    bird.style.width = BW + "px"; bird.style.height = BH + "px";
    dirty = true;
  }
  addEventListener("resize", resize);

  
  const CAM_KEYS = [[0, 0.5], [40, 0.5], [54, 0.22], [72, 0.22], [80, 0.36], [88, 0.55], [100, 0.58], [119, 0.5]];
  function camAt(i) {
    const k = CAM_KEYS, n = count ? (i / Math.max(1, count - 1)) * 119 : 0;
    for (let j = 1; j < k.length; j++) if (n <= k[j][0]) return lerp(k[j - 1][1], k[j][1], ss(k[j - 1][0], k[j][0], n));
    return k[k.length - 1][1];
  }

  
  let target = REDUCED ? 1 : 0, cur = target, camU = START[0], lastIdx = -1, lastRectKey = "";
  let facing = -1, flap = 0, lastT = performance.now(), vel = 0;

  function render(p) {
    const now = performance.now(), dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;

    let camOk = true;
    let u, v, fold = 1, wingS = 0.6, scale = 1, alpha = 1, dirU = 0, dirV = 0;
    if (p < 0.18) {
      fold = ss(0.06, 0.18, p); [u, v] = START;
    } else if (p < 0.30) {
      const h = lin(0.18, 0.30, p);
      u = lerp(START[0], HOP_END[0], h); v = START[1] - 0.06 * Math.abs(Math.sin(h * Math.PI * 2));
      dirU = -1; wingS = 0.6 + 0.4 * Math.abs(Math.sin(h * Math.PI * 2));
    } else {
      const t = ss(0.30, 0.92, p);
      [u, v] = at(t); const n = at(t + 0.01); dirU = n[0] - u; dirV = n[1] - v;
      scale = lerp(1, 0.32, ss(0.74, 1, t)); alpha = 1 - ss(0.9, 1, t);
      flap += dt * (11 + Math.min(14, Math.abs(vel) / 160));
      const c = (Math.cos(flap) + 1) / 2;
      wingS = lerp(-0.55, 1, c);
    }
    if (Math.abs(dirU) > 0.0004) facing = dirU < 0 ? -1 : 1;

    const ft = ss(CFG.frames[0], CFG.frames[1], p);
    const idx = count ? Math.round(ft * (count - 1)) : 0;

    if (portrait) {
      const camT = CFG.bird ? u
        : camAt(idx);
      camU += (camT - camU) * (FIX !== null ? 1 : 1 - Math.pow(0.92, dt * 60)); camOk = Math.abs(camT - camU) < 5e-4;
      rect.x = clamp(W / 2 - camU * rect.w, W - rect.w, 0);
    }
    const key = `${rect.x | 0},${rect.y | 0},${rect.w | 0}`;
    if (count && (idx !== lastIdx || key !== lastRectKey || dirty)) {
      const im = frameAt(idx);
      if (im) {
        fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        fctx.clearRect(0, 0, W, H);
        fctx.drawImage(im, rect.x, rect.y, rect.w, rect.h);
        const s = Math.max(back.width / IW, back.height / IH);
        bctx.drawImage(im, (back.width - IW * s) / 2, (back.height - IH * s) / 2, IW * s, IH * s);
        lastIdx = idx; lastRectKey = key; dirty = false;
      }
    }

    const bw = BW, bh = BH;
    const x = rect.x + u * rect.w, y = rect.y + v * rect.h;
    const tilt = p >= 0.30 ? clamp(Math.atan2(dirV * 9, Math.abs(dirU) * 16 + 1e-4) * 57.3 * 0.55, -32, 32) : 0;
    bird.style.opacity = REDUCED || !CFG.bird ? 0 : alpha;
    bird.style.transform = `translate(${x - bw * 0.5}px, ${y - bh * 0.66}px) scale(${facing * scale}, ${scale}) rotate(${facing * tilt}deg)`;
    sheet.style.opacity = 1 - ss(0.35, 1, fold);
    sheet.style.transform = `rotate(${-fold * 12}deg) scale(${1 - 0.5 * fold}, ${1 - 0.85 * fold})`;
    crane.style.opacity = Math.min(1, fold * 2.2);
    crane.style.transform = `scale(${lerp(0.25, 1, fold)}, ${lerp(0.05, 1, fold)})`;
    const ws = p < 0.18 ? lerp(0.1, 0.6, fold) : wingS;
    wingN.style.transform = `scaleY(${ws})`;
    wingF.style.transform = `scaleY(${lerp(0.85, 1, (ws + 0.55) / 1.55) * ws})`;

    vel *= Math.pow(0.02, dt);
    if (FX) {
      rays.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
      rays.style.opacity = REDUCED ? 0.8 : lerp(0.3, 0.9, ss(0.45, 0.9, p));
      if (!REDUCED) drawLeaves(p, dt);
    }

    if (DOODLE) {
      dsvg.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
      for (const d of dpaths) {
        const k = ss(d.a0, d.a1, p);
        if (d.dot) d.dot.style.opacity = k; else d.el.style.strokeDashoffset = d.L * (1 - k);
      }
    }

    const ho = 1 - lin(0.02, 0.08, p);
    hint.style.opacity = ho; hint.classList.toggle("is-off", ho === 0);
    if (glows) {
      glows.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
      glows.style.opacity = lastIdx < 0 ? 0 : ss(0.74, 0.9, p) * (REDUCED ? 1 : 0.88 + 0.12 * Math.sin(now / 420) * Math.sin(now / 1130));
    }
    const tt = ss(CFG.title[0], CFG.title[1], p);
    title.style.opacity = tt;
    title.style.transform = `translateY(${(1 - tt) * 18}px)`;
    bar.style.transform = `scaleX(${p})`;
    if (DEBUG) document.body.dataset.debug = JSON.stringify({ p: +p.toFixed(3), u: +u.toFixed(3), v: +v.toFixed(3), x: x | 0, y: y | 0, bw, bh, op: bird.style.opacity, reduced: REDUCED, rect, idx: lastIdx });
    return camOk && !(FX && !REDUCED && p > 0.5) && !(CFG.bird && !REDUCED && p >= 0.30 && alpha > 0) && !(glows && !REDUCED && p > 0.74);
  }

  
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!REDUCED && FIX === null) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.create({
      trigger: hero, start: "top top", end: "bottom bottom",
      onUpdate: s => { target = s.progress; vel = s.getVelocity(); }
    });
  }
  if (FIX !== null) target = cur = clamp(FIX, 0, 1);
  
  let live = true, settled = false;
  new IntersectionObserver(([e]) => { live = e.isIntersecting; if (live) { dirty = true; lastT = performance.now(); } }).observe(hero);
  gsap.ticker.add((t, dms) => {
    if (!live) return;
    const was = cur;
    cur += (target - cur) * (1 - Math.pow(0.78, Math.min(dms, 100) / 16.667)); if (Math.abs(target - cur) < 1e-4) cur = target;
    if (settled && cur === was && !dirty) { lastT = performance.now(); return; }
    settled = render(cur);
  });

  $(".skip").addEventListener("click", e => { if (lenis) { e.preventDefault(); lenis.scrollTo("#next", { duration: 0.6 }); } });
  window.__hero = { set: p => { target = cur = clamp(p, 0, 1); dirty = true; } };
})();
