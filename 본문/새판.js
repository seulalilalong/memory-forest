
(() => {
  const root = document.documentElement;
  const fit = () => {
    const w = root.clientWidth;
    root.style.setProperty("--z", Math.min(1, w / 1200).toFixed(4));
    const road = document.querySelector(".n12__road");
    if (road) root.style.setProperty("--zr", Math.min(1, (road.parentElement.clientWidth) / 1040).toFixed(4));
    root.style.setProperty("--zm", Math.min(1, (w - 8) / 720).toFixed(4));
    root.style.setProperty("--z10m", Math.min(1, w / 1044).toFixed(4));
    root.style.setProperty("--z7m", (w / 1100).toFixed(4));
    const bar = document.querySelector(".topbar"), tb = bar && getComputedStyle(bar).position === "fixed" ? bar.getBoundingClientRect().height : 0;
    const z9 = Math.min(1, w / 1200, Math.max(.45, (innerHeight - tb) / 960));
    root.style.setProperty("--z9", z9.toFixed(4)); root.style.setProperty("--tb9", (tb / z9).toFixed(1) + "px"); root.style.setProperty("--tbpx", tb.toFixed(1) + "px");
  };
  fit(); addEventListener("resize", fit); addEventListener("load", fit); setTimeout(fit, 600);

  const run = document.getElementById("n9run"); if (!run) return;
  const book = run.querySelector(".n9__book"), hint = run.querySelector(".n9__hint");
  const cover = book.querySelector(".lf--cover"), sheets = ["s1", "s2", "s3", "s4"].map(c => book.querySelector("." + c)), sheen = book.querySelector(".sheen"), sheenIn = sheen && sheen.firstElementChild;
  const leaves = [...run.querySelectorAll(".leaf")];
  const clamp = v => Math.min(1, Math.max(0, v)), seg = (p, a, b) => clamp((p - a) / (b - a)), ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const flip = (el, t, za, zb) => { const a = -180 * t; el.style.transform = `rotateY(${a}deg)`; el.style.zIndex = a < -90 ? zb : za; };
  function render(p) {
    const c = ease(seg(p, .04, .34));
    book.style.transform = `translateX(${124 * c}px)`;
    flip(cover, c, 10, 20);
    sheets.forEach((el, i) => flip(el, ease(seg(p, .24 + .07 * i, .44 + .07 * i)), 9 - i, 21 + i));
    leaves.forEach((el, k) => { const t = seg(p, .52 + .04 * k, .80 + .015 * k), e = 1 - Math.pow(1 - t, 3), r = +el.dataset.r;
      const x = -60 * (1 - e) + Math.sin(t * Math.PI * 1.6) * 34 * (1 - t), y = -420 * (1 - e), rot = r - 140 * (1 - e) + 18 * Math.sin(t * Math.PI) * (1 - t);
      el.style.opacity = Math.min(1, t * 3); el.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg)`; });
    const sh = seg(p, .86, .99); sheen.style.opacity = Math.sin(sh * Math.PI); if (sheenIn) sheenIn.style.transform = `translateX(${(-80 + 98.44 * sh).toFixed(2)}%)`;
    if (hint) hint.style.opacity = p > .03 ? 0 : 1;
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shot = /[?&]shot=/.test(location.search);
  if (shot) { run.style.height = "auto"; const f = run.querySelector(".n9__frame"); f.style.position = "relative"; f.style.top = "0"; }
  if (reduce || shot || /open/.test(location.hash)) { render(1); return; }
  let ticking = false, last = -1;
  const go = () => { const r = run.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, run.offsetHeight - innerHeight)); if (p !== last) { last = p; render(p); } ticking = false; };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(go); } }, { passive: true });
  addEventListener("resize", go); go();
})();


(() => {
  const shelf = document.getElementById("n8shelf"); if (!shelf) return;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const MIX = ["#733A12", "#6E8650", "#994D18", "#A0703F", "#868069", "#BBC99B", "#5E2F0F", "#839A61", "#B5652C"], LIGHT = new Set(["#BBC99B"]);
  fetch("본문/내용.json?v=202610221859").then(r => r.json()).then(D => {
    const SH = D.SHELVES, notes = D.BOOK_NOTES || {};
    const RECENT = D.RECENT || [], seen = new Set(RECENT.map(r => r.t));
    const ALL = RECENT.map(r => ({ t: r.t, a: r.a, k: r.k, when: r.when, img: r.img }))
      .concat(D.BOOKS.filter(b => !seen.has(b[0])).map(b => ({ t: b[0], a: b[1], k: b[2], img: b[3] })));
    const ORDER = ["all", "g", "n", "b", "s", "d"], LABEL = Object.assign({ all: "전체" }, SH);
    let cat = "all", open = false;
    document.getElementById("n8count").textContent = `${ALL.length}권`;
    const tabs = document.getElementById("n8tabs");
    tabs.innerHTML = ORDER.map(k => `<li><button type="button" role="tab" data-k="${k}" aria-selected="${k === "all"}">${esc(LABEL[k])}</button></li>`).join("");
    const more = document.getElementById("n8more"), note = document.getElementById("n8note");
    const cover = (b, i) => b.img ? `<img src="사진/${b.img}.jpg" alt="『${esc(b.t)}』 표지">`
      : `<span class="n8__cv${LIGHT.has(MIX[i % MIX.length]) ? " light" : ""}" style="--c:${MIX[i % MIX.length]}"><b>${esc(b.t)}</b><i>${esc(b.a)}</i></span>`;
    const draw = (anim) => {
      const list = ALL.filter(b => cat === "all" || [...b.k].includes(cat));
      const n = open ? list.length : 6;
      shelf.innerHTML = list.slice(0, n).map((b, i) => `<li class="n8__bk"><button type="button" aria-pressed="false" data-t="${esc(b.t)}"><span class="n8__stand">${cover(b, i)}</span><b class="t">${esc(b.t)}</b><span class="a">${esc(b.a)}</span>${b.when ? `<small>${esc(b.when)}</small>` : `<small>${esc([...b.k].map(x => SH[x]).filter(Boolean).join(" · "))}</small>`}</button></li>`).join("");
      more.hidden = list.length <= 6; more.textContent = open ? "접기" : `전체 보기 (${list.length}권)`; more.setAttribute("aria-expanded", open);
      shelf.querySelectorAll("button").forEach(x => x.addEventListener("click", () => showNote(x.dataset.t)));
      if (anim) [...shelf.children].slice(6, 18).forEach((li, j) => { li.style.animationDelay = j * 30 + "ms"; li.classList.add("x-in-up"); });
    };
    const showNote = t => {
      const b = ALL.find(x => x.t === t); if (!b) return; const n = notes[t];
      note.hidden = false; note.classList.remove("x-in-up"); void note.offsetWidth; note.classList.add("x-in-up");
      note.innerHTML = `<b>『${esc(b.t)}』</b> <span style="color:var(--deep)">${esc(b.a)}</span>` + (n ? `<span class="when">${esc(n[0])}</span><p>${esc(n[1])}</p>` : `<p style="color:var(--deep)">책방지기 쪽지가 아직 없는 책이에요.</p>`);
      shelf.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x.dataset.t === t));
    };
    tabs.querySelectorAll("button").forEach(x => x.addEventListener("click", () => { cat = x.dataset.k; open = false; tabs.querySelectorAll("button").forEach(y => y.setAttribute("aria-selected", y === x)); note.hidden = true; draw(); }));
    more.addEventListener("click", () => { open = !open; draw(open);
      if (!open) { const y = tabs.getBoundingClientRect().top - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tbpx")) || 0) - 16; if (y < 0) scrollTo(0, scrollY + y); } });
    draw();
  });
})();


(() => {
  const root = document.getElementById("clubs"); if (!root || !root.classList.contains("n6")) return;
  const P = "사진/", TODAY = new Date().toISOString().slice(0, 10);
  const $id = id => document.getElementById(id);
  fetch("본문/내용.json?v=202610221859").then(r => r.json()).then(D => { const CLUBS = D.CLUBS6 || []; if (!CLUBS.length) return;

  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const WD = "일월화수목금토";
  const eun = w => { const c = w.charCodeAt(w.length - 1); return w + (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 ? "은" : "는"); };
  const day = d => { const x = new Date(d + "T00:00:00"); return { w: WD[x.getDay()] + "요일", t: (x.getMonth() + 1) + "월 " + x.getDate() + "일" }; };
  const replay = (el, cls, d) => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.style.animationDelay = d + "ms"; el.classList.add(cls); };
  
  $id("n6covers").innerHTML = CLUBS.map((x, i) => `<button type="button" class="x6-cv" data-k="${i}" aria-pressed="false"><div class="x6-cv__shelf">${x.cover ? `<img class="x6-cv__img" src="${P + x.cover}" alt="『${esc(x.book)}』 표지">` : `<div class="x6-cv__slot">${esc(x.book)}<br>표지 자리</div>`}</div><b>${esc(x.name)}</b></button>`).join("");
  const covers = [...root.querySelectorAll(".x6-cv")];
  covers.forEach(b => b.onclick = () => show(+b.dataset.k, true));
  function show(k, anim) {
    const c = CLUBS[k], s = c.spread, op = $id("n6open");
    if (s.type === "book") { op.className = "x6-at x6-open"; op.innerHTML = ["l", "r"].map(z => `<div class="x6-pg x6-pg--${z}${s.dark ? "" : " x6-pg--light"}" style="aspect-ratio:${s.ar};background-image:url(${P + s[z]})"></div>`).join(""); }
    else if (s.type === "flat") { op.className = "x6-at x6-open x6-open--flat"; op.innerHTML = `<img src="${P + s.l}" alt=""><img src="${P + s.r}" alt="">`; }
    else { op.className = "x6-at x6-open x6-open--none"; op.innerHTML = esc(s.text || ""); }
    $id("n6hero").innerHTML = `<p class="x6-lab">${esc(c.label || "지금 함께 읽는 책")}</p><h3>${esc(c.book)}</h3>
      <p class="x6-when"><b>${esc(c.name)}</b><br>${esc(c.when)}</p><p class="x6-say">${esc(c.say)}</p>
      <p class="x6-by">${c.face ? `<img src="${P + c.face}" alt="">` : ""}${esc(c.author)}</p>`;
    covers.forEach((b, i) => { b.classList.toggle("x6-on", i === k); b.setAttribute("aria-pressed", i === k); });
    $id("n6how").innerHTML = `<h3 class="x6-ttl" style="margin:0">${esc(eun(c.name))} 이렇게 모여요</h3><ol>${c.steps.map(t => `<li>${esc(t)}</li>`).join("")}</ol>`;
    const nx = c.dates.findIndex(d => d.d >= TODAY);
    $id("n6days").innerHTML = `<h3 class="x6-ttl" style="margin:0">모이는 날</h3>` + (c.dates.length ? `<div class="x6-dates${c.dates.length > 3 ? " x6-dates--many" : ""}" style="grid-template-columns:repeat(${c.dates.length},1fr)">${c.dates.map((d, i) => { const y = day(d.d); return `<div class="x6-dt ${i < nx || nx < 0 ? "x6-dt--past" : i === nx ? "x6-dt--next" : ""}"><span>${y.w}</span><b>${y.t}</b>${d.note ? `<small>${esc(d.note)}</small>` : ""}</div>`; }).join("")}</div>` : `<p class="x6-days__none">모이는 날은 곧 알려 드려요</p>`);
    $id("n6revs").innerHTML = `<h3 class="x6-ttl" style="margin:0">다녀간 사람의 한 줄</h3><div class="x6-tl">${c.revs.map(r => `<div class="x6-tl__it"><b>${esc(c.name)}에 다녀간 분</b><i></i><i></i><div class="x6-tl__foot"><span>${esc(r.t)}</span><span>${esc(r.when)}</span></div></div>`).join("")}</div>`;
    if (anim) ["n6open", "n6hero", "n6how", "n6days", "n6revs"].forEach((id, n) => replay($id(id), "x6-swap", n * 40));
  }
  show(0);
  }).catch(() => {});
})();

(() => {
  let ticking = false;
  const sweep = () => {
    ticking = false;
    const h = innerHeight * 0.96;
    document.querySelectorAll(".rv:not(.in)").forEach(el => { if (el.getBoundingClientRect().top < h) el.classList.add("in"); });
  };
  const ask = () => { if (!ticking) { ticking = true; requestAnimationFrame(sweep); } };
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", ask);
  addEventListener("load", sweep);
  sweep();
})();


(() => {
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  document.querySelectorAll(".x16__panel").forEach(pn => {
    const row = pn.querySelector(".x16__row"), bar = pn.querySelector(".x16__track i");
    if (!row || !bar) return;
    const upd = () => { const max = row.scrollWidth - row.clientWidth, room = bar.parentElement.clientWidth - bar.offsetWidth; bar.style.transform = `translateX(${max > 0 ? row.scrollLeft / max * room : 0}px)`; };
    row.addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
  });
  const STAMP = [["G30_우표_공책연필", "펼친 공책과 연필 우표"], ["G31_우표_창가화분", "책방 격자 창과 화분 우표"], ["G32_우표_찻잔책", "찻잔과 쌓인 책 우표"], ["G33_우표_숲길", "숲 오솔길 우표"]];
  fetch("본문/내용.json?v=202610221859").then(r => r.json()).then(D => {
    const n14 = document.getElementById("x14notes");
    if (n14 && D.HUGI && D.HUGI.length) n14.innerHTML = D.HUGI.map(h => `<li class="x14__paper"><p>${esc(h.t)}</p><span class="by">${esc(h.by)}</span></li>`).join("");
    const no = i => String(i + 1).padStart(2, "0");
    const rowP = document.querySelector('.x16__panel[aria-label="지원 프로그램"] .x16__row'), rowT = document.querySelector("#talks .x16__row");
    if (rowP && D.PROG_CARDS) { rowP.innerHTML = D.PROG_CARDS.map((c, i) => `<li class="x16__card"><span class="no">${no(i)}</span><h3>${esc(c.t)}</h3><p>${esc(c.when)}${c.where ? `<br>${esc(c.where)}` : ""}</p>${c.img ? `<img class="pic${c.poster ? " poster" : ""}" src="사진/${esc(c.img)}" alt="${esc(c.alt)}" loading="lazy"${c.pos ? ` style="object-position:${esc(c.pos)}"` : ""}>` : ""}</li>`).join("");
      rowP.closest(".x16__panel").querySelector(".when b").textContent = D.PROG_CARDS.length; }
    if (rowT && D.TALK_CARDS) { rowT.innerHTML = D.TALK_CARDS.map((c, i) => `<li class="x16__card"><span class="no">${no(i)}</span><h3>${esc(c.who)}</h3><p>${esc(c.when)}</p>${c.img ? `<span class="cover"><img src="사진/${esc(c.img)}" alt="${esc(c.alt)}" loading="lazy"></span>` : ""}</li>`).join("");
      rowT.closest(".x16__panel").querySelector(".when b").textContent = D.TALK_CARDS.length; }
    if (rowP || rowT) dispatchEvent(new Event("resize"));
    const n19 = document.getElementById("x19posts");
    if (n19 && D.DIARY_PICK) n19.innerHTML = D.DIARY_PICK.slice(0, 4).map((p, i) => `<li class="x19__post"><img class="stamp" src="사진/${STAMP[i][0]}.png" alt="${STAMP[i][1]}" loading="lazy"><div class="slip"><time>${esc(p.d)}</time><h3>${esc(p.t)}</h3><p>${esc(p.s)}</p><a href="${esc(p.link)}" target="_blank" rel="noopener">글 더보기</a></div></li>`).join("");
    const body = document.getElementById("x18body"), dots = document.getElementById("x18dots");
    const P = (D.PRESS || []).map(p => ({ k: /영상/.test(p.k) ? "영상" : /방송|라디오/.test(p.k) ? "방송" : "신문", t: p.t, who: `${esc(p.outlet)}<br>${esc(p.d)}`, line: String(p.s || "").split(/(?<=\.)\s+/)[0], go: p.go, link: p.link, img: p.img, pos: p.pos, alt: p.alt }));
    if (!body || !P.length) return;
    let at = 0;
    dots.innerHTML = P.map(() => "<i></i>").join("");
    
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const ph = document.getElementById("x18ph");
    const swap = (el, how) => {
      const run = el.getAnimations().find(a => a.id === "x18"), cs = getComputedStyle(el);
      const o = run ? +cs.opacity : 0, x = run ? parseFloat(cs.translate) || 0 : reduce.matches || how === "f" ? 0 : how === "r" ? 16 : -16;
      if (run) run.cancel();
      el.animate([{ opacity: o, translate: `${x}px 0` }, { opacity: 1, translate: "0 0" }], { duration: reduce.matches ? 120 : how === "f" ? 200 : 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)", id: "x18" });
    };
    const show = (n, how) => {
      at = (n + P.length) % P.length; const p = P[at];
      body.innerHTML = `<h3>${esc(p.t)}</h3><p class="who">${p.who}</p>${p.line ? `<p class="line">${esc(p.line)}</p>` : ""}${p.link && p.go ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.go)}</a>` : ""}`;
      ph.hidden = !p.img;
      if (p.img) { const im = ph.firstElementChild; im.src = "사진/" + p.img; im.alt = p.alt || ""; im.style.objectPosition = p.pos || "50% 50%"; }
      document.querySelectorAll("#x18tabs button").forEach(b => b.classList.toggle("on", b.dataset.k === p.k));
      dots.querySelectorAll("i").forEach((d, j) => d.classList.toggle("on", j === at));
      if (how) { swap(body, how); if (p.img) swap(ph, how); }
    };
    document.getElementById("x18prev").onclick = () => show(at - 1, "l");
    document.getElementById("x18next").onclick = () => show(at + 1, "r");
    document.querySelectorAll("#x18tabs button").forEach(b => b.onclick = () => { const j = P.findIndex(p => p.k === b.dataset.k); if (j >= 0) show(j, "f"); });
    show(0);
    new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { P.forEach(p => { if (p.img) new Image().src = "사진/" + p.img; }); io.disconnect(); } }, { rootMargin: "600px 0px" }).observe(body);
  }).catch(() => {});
})();

(() => {
  const cal0 = document.getElementById("x7cal");
  if (!cal0) return;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const P = "사진/", W = "일월화수목금토", cw = 863 / 7, rh = 717 / 5;
  function draw(paper, MO) {
    const cal = paper.querySelector(".x7__cal"), list = paper.querySelector(".x7__list");
    const [Y, M] = MO.ym.split("-").map(Number), now = new Date();
    const TODAY = now.getFullYear() === Y && now.getMonth() + 1 === M ? now.getDate() : 0;
    const EV = {}; (MO.days || []).forEach(e => { if (e.d) EV[e.d] = e; });
    const BANDS = (MO.bands || []).filter(b => b.from && b.to >= b.from), inBand = d => BANDS.find(b => d >= b.from && d <= b.to);
    paper.querySelector(".x7__mon").textContent = M + "월"; paper.querySelector(".x7__yr").textContent = Y;
    const memo = paper.querySelector(".x7__memo"); if (memo) memo.innerHTML = "<small>메모</small>" + (MO.memo || []).filter(Boolean).map(m => `<p>${esc(m)}</p>`).join("");
    const first = new Date(Y, M - 1, 1).getDay(), last = new Date(Y, M, 0).getDate(), prevLast = new Date(Y, M - 1, 0).getDate();
    const cells = []; for (let i = first - 1; i >= 0; i--) cells.push({ n: prevLast - i, out: 1 }); for (let d = 1; d <= last; d++) cells.push({ n: d }); while (cells.length % 7) cells.push({ n: cells.length - first - last + 1, out: 1 });
    cal.innerHTML = cells.map(c => { const e = !c.out && EV[c.n], band = !c.out && inBand(c.n);
      return `<div class="d${c.out ? " d--out" : ""}${!c.out && c.n === TODAY ? " d--today" : ""}${band ? " d--band" : ""}"><span class="d__n">${c.n}</span>` +
        (e ? `${e.img ? `<div class="d__pic${e.icon ? " d__pic--icon" : ""}"><img src="${P + esc(e.img)}" alt="" loading="lazy"></div>` : ""}${band && band.t === e.t ? "" : `<span class="d__lab">${esc(e.t)}</span>`}` : "") + `</div>`; }).join("");
    BANDS.forEach(b => { const rows = {};
      for (let d = b.from; d <= Math.min(b.to, last); d++) { const i = first + d - 1, r = Math.floor(i / 7); (rows[r] = rows[r] || []).push(i % 7); }
      Object.entries(rows).forEach(([r, cols], k) => { const el = document.createElement("div"); el.className = "band"; el.textContent = k ? (b.short || b.t) : b.t;
        el.style.cssText = `left:${cols[0] * cw + 8}px;top:${r * rh + 46}px;width:${cols.length * cw - 16}px`; cal.appendChild(el); }); });
    if (list) list.innerHTML = Object.values(EV).sort((a, b) => a.d - b.d).map(e => `<li${e.d === TODAY ? ' class="today"' : ""}><time>${M}월 ${e.d}일 (${W[new Date(Y, M - 1, e.d).getDay()]})</time><span>${esc(e.t)}</span></li>`).join("");
  }
  fetch("본문/내용.json?v=202610221859").then(r => r.json()).then(D => {
    const MO = D.MONTH || {}, ok = m => m && /^\d{4}-\d{1,2}$/.test(m.ym || "");
    const months = (Array.isArray(MO.months) ? MO.months : [MO]).filter(ok).sort((a, b) => a.ym.localeCompare(b.ym));
    if (!months.length) return;
    const now = new Date(), key = (y, m) => `${y}-${String(m).padStart(2, "0")}`;
    const thisYM = key(now.getFullYear(), now.getMonth() + 1), nextYM = key(now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(), now.getMonth() === 11 ? 1 : now.getMonth() + 2);
    const cur = months.find(m => m.ym === thisYM) || months.filter(m => m.ym < thisYM).pop() || months[0];
    const next = months.find(m => m.ym === nextYM && m !== cur);
    const paper = cal0.closest(".x7__paper"); draw(paper, cur);
    if (!next) return;
    const stage = paper.parentElement, tape = stage.querySelector(".x7__tape");
    const head = document.createElement("p"); head.className = "x7__nexthead"; head.textContent = `${+next.ym.slice(5, 7)}월 일정도 미리 올려 두었어요`;
    const p2 = paper.cloneNode(true); p2.querySelectorAll("[id]").forEach(e => e.removeAttribute("id")); p2.classList.add("x7__paper--next");
    stage.append(head, p2);
    if (tape) { const t2 = tape.cloneNode(true); t2.classList.add("x7__tape--next"); stage.append(t2); }
    stage.closest(".x7").classList.add("x7--two");
    draw(p2, next);
  }).catch(() => {});
})();

(() => {
  const els = document.querySelectorAll("[data-photo]"); if (!els.length) return;
  fetch("본문/내용.json?v=202610221859").then(r => r.json()).then(D => {
    const PH = D.PHOTOS || {};
    els.forEach(el => { const p = PH[el.dataset.photo]; if (!p || !p.src) return; const url = "사진/" + p.src;
      if (el.tagName === "IMG") { if (el.getAttribute("src") !== url) el.src = url; el.alt = p.alt || ""; el.style.objectPosition = p.pos || ""; }
      else { el.style.backgroundImage = `url("${url}")`; el.style.backgroundPosition = p.pos || ""; el.setAttribute("aria-label", p.alt || ""); } });
  }).catch(() => {});
})();

(() => {
  const root = document.documentElement;
  fetch("본문/내용.json?v=202610221859").then(r => r.json()).then(D => {
    const get = p => p.split(".").reduce((o, k) => (o == null ? o : o[k]), D);
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    document.querySelectorAll("[data-t]").forEach(el => { const v = get(el.dataset.t); if (typeof v === "string") el.innerHTML = esc(v).replace(/\n/g, "<br>"); });
    document.querySelectorAll("[data-href]").forEach(a => { const v = get(a.dataset.href); if (v) a.href = v; });
    const S = D.SITE || {}, tel = String(S.phone || "").replace(/\D/g, "");
    if (tel) {
      document.querySelectorAll(".js-sms").forEach(a => { a.href = `sms:${tel}?&body=${encodeURIComponent(S.sms || "")}`; });
      document.querySelectorAll("[data-sms]").forEach(a => { a.href = `sms:${tel}?&body=${encodeURIComponent(get(a.dataset.sms) || "")}`; });
      document.querySelectorAll("[data-tel]").forEach(a => { a.href = "tel:" + tel; });
    }
    if (S.title) document.title = S.title;
  }).catch(() => {}).finally(() => root.classList.remove("t-wait"));
})();

(() => {
  const els = [...document.querySelectorAll("[data-reveal]")]; if (!els.length) return;
  if (/[?&]shot=/.test(location.search)) { els.forEach(e => e.classList.add("is-in")); return; }
  document.documentElement.classList.add("x-motion");
  let t = false;
  const sweep = () => { t = false; const h = innerHeight * 0.85;
    const on = els.filter(e => { if (e.classList.contains("is-in")) return false; const r = e.getBoundingClientRect(); return r.top + r.height * (+e.dataset.revealAt || 0) < h; });
    on.forEach(e => e.classList.add("is-in")); };
  const ask = () => { if (!t) { t = true; requestAnimationFrame(sweep); } };
  addEventListener("scroll", ask, { passive: true }); addEventListener("resize", ask); addEventListener("load", sweep);
  requestAnimationFrame(sweep);
})();
