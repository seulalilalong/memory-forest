

(() => {
  if (!/[?&]draft=1/.test(location.search)) return;
  let d = null; try { d = localStorage.getItem("site-draft"); } catch {}
  if (!d) return;
  const real = window.fetch.bind(window);
  window.fetch = (u, o) => /(^|\/)본문\/내용\.json$/.test(decodeURIComponent(String(u)).split("?")[0]) ? Promise.resolve(new Response(d, { headers: { "Content-Type": "application/json" } })) : real(u, o);
})();
(() => {
  const qs = new URLSearchParams(location.search);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SHOT = qs.get("shot");
  if (qs.get("label") === "0") document.body.classList.add("no-label");

  const PHONE = "01048451007";
  const SMS = "책방기억의숲 모임 체험 예약 문의드립니다. (모임 · 희망 날짜 · 인원: )";
  $$(".js-sms").forEach(a => { a.href = `sms:${PHONE}?&body=${encodeURIComponent(SMS)}`; });

  
  const COL = { nd: "#994D18", gj: "#733A12", bd: "#6E8650", gs: "#868069", bg: "#A0703F", sp: "#A0703F", mp: "#BBC99B", po: "#B9B48A", ki: "#C2683C", ch: "#7E6A4C", ev: "#4A3A2A" };
  const LIGHTC = new Set(["#BBC99B", "#B9B48A", "#DDDAB2", "#C9D4AE", "#E8E2C2"]);
  const SHORT = { nd: "낭독&필사", gj: "월 한 권 고전", bd: "벽돌책", gs: "글쓰기", sp: "번데기", bg: "번데기", mp: "맘편한", po: "시 낭송", ki: "기억쓰기", ch: "어린이", ev: "행사" };
  const NOWBOOK = { nd: ["라스트 울프", "크러스너호르커이 라슬로"], gj: ["눈물 상자", "한강"], bd: ["변신 이야기", "오비디우스"], gs: ["유혹하는 글쓰기", "스티븐 킹"], bg: ["아Q정전", "루쉰"], sp: ["아Q정전", "루쉰"] };
  const cover = (t, a, c) => `<span class="cv${LIGHTC.has(c) ? " light" : ""}" style="--c:${c}"><b>${esc(t)}</b><i>${esc(a || "")}</i></span>`;
  const chip = k => `<i class="${LIGHTC.has(COL[k]) ? "light" : ""}" style="background:${COL[k] || "#868069"}">${esc(SHORT[k] || k)}</i>`;
  const dot = d => d.replace(/^(\d{4})-0?(\d+)-0?(\d+)$/, "$1. $2. $3");

  
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  const watch = () => $$(".rv:not(.in)").forEach(el => io.observe(el));
  const hero = $("#hero"), bar = $(".topbar");
  const solid = () => bar.classList.toggle("solid", !!SHOT || scrollY > hero.offsetHeight - innerHeight * 0.4);
  addEventListener("scroll", solid, { passive: true }); solid();
  const mbtn = $(".menu-btn");
  const setMenu = open => { bar.classList.toggle("open", open); mbtn.setAttribute("aria-expanded", open); mbtn.textContent = open ? "닫기" : "메뉴"; };
  mbtn.addEventListener("click", () => setMenu(!bar.classList.contains("open")));
  $$("#mainMenu a").forEach(a => a.addEventListener("click", () => setMenu(false)));

  
  const stage = $("#piecesStage"), pieces = $$(".piece", stage), say = $("#pieceSay"), sayN = $("#pieceN");
  const SAY0 = say.textContent, SAY_END = "이 조각들이 한 편이 되고, 어린 나에게 쓰는 편지가 돼요.";
  const setSay = i => { const t = i === 0 ? SAY0 : i > pieces.length ? SAY_END : pieces[i - 1].dataset.say; if (say.textContent !== t) say.textContent = t; sayN.textContent = Math.min(i, pieces.length); };
  const PIN = !REDUCED && !SHOT && window.gsap && window.ScrollTrigger && innerWidth > 900;
  function piecesScroll() {
    pieces.forEach(p => { p.classList.remove("hide"); p.style.transition = "none"; });
    const film = $("#vfilm"), box = $(".pieces__film");
    const tl = gsap.timeline({ scrollTrigger: { trigger: "#pieces", start: "top top", end: "+=260%", scrub: 0.6, pin: true, anticipatePin: 1,
      onUpdate: st => setSay(Math.floor(st.progress * (pieces.length + 1.4))) } });
    tl.to(film, { y: () => -(film.offsetHeight - box.offsetHeight * 0.9), ease: "none", duration: pieces.length + 1.4 }, 0);
    pieces.forEach((p, i) => {
      const r = parseFloat(getComputedStyle(p).getPropertyValue("--r")) || 0;
      tl.fromTo(p, { y: "70vh", rotation: r - 16, opacity: 0 }, { y: 0, rotation: r, opacity: 1, duration: 1, ease: "power2.out" }, i);
    });
    tl.to(pieces, { scale: 0.62, x: (i, el) => { const t = stage.getBoundingClientRect(), b = el.getBoundingClientRect(); return t.left + t.width / 2 - (b.left + b.width / 2) + (i - 2) * 24; },
      y: (i, el) => { const t = stage.getBoundingClientRect(), b = el.getBoundingClientRect(); return t.top + t.height / 2 - (b.top + b.height / 2) + (i - 2) * 6; },
      rotation: i => (i - 2) * 3, duration: 1.2, ease: "power2.inOut" }, pieces.length + 0.2);
  }
  function piecesReveal() {
    new IntersectionObserver((es, o) => es.forEach(e => {
      if (!e.isIntersecting) return;
      pieces.forEach((p, i) => setTimeout(() => p.classList.remove("hide"), REDUCED ? 0 : 280 * i)); o.disconnect();
    }), { threshold: .2 }).observe(stage);
  }

  
  fetch("본문/내용.json?v=202610231435").then(r => r.json()).then(D => {
    const last = D.TIMELINE[D.TIMELINE.length - 1], [Y, M] = last.ym.split("-").map(Number);
    const pick2 = (last.m || []).filter(m => /『/.test(m[1])).slice(0, 2).map(m => `${SHORT[m[0]] || ""} ${m[1].match(/『[^』]+』/)[0]}`);
    $("#topNote").textContent = (D.MONTH && D.MONTH.top) || `${M}월 모임 신청 받는 중 · ${pick2.join(" · ")} →`;

    const CL = D.CLUBS;
    $("#clubChips").innerHTML = CL.map((c, i) => `<button class="chip" role="tab" data-i="${i}" aria-selected="${i === 0}">${esc(c.name)}</button>`).join("");
    const showClub = i => {
      const c = CL[i], b = NOWBOOK[c.id] || ["", ""];
      $("#clubShow").innerHTML = `<h3>${esc(c.name)}</h3><p class="tag">${esc(c.tag)}</p><ol>${c.flow.map(f => `<li>${esc(f)}</li>`).join("")}</ol><p>${esc(c.desc)}</p><p style="margin-top:12px"><a class="link" href="#month">이번 달 일정 보기 →</a></p>`;
      $("#clubBook").innerHTML = `<p class="panel__label">지금 함께 읽는 책</p>${cover(b[0], b[1], COL[c.id])}<p>『${esc(b[0])}』 · ${esc(b[1])}</p><p class="small soft">책 사진이 오면 바꿔요</p>`;
      $$("#clubChips .chip").forEach(x => x.setAttribute("aria-selected", +x.dataset.i === i));
    };
    $$("#clubChips .chip").forEach(x => x.addEventListener("click", () => showClub(+x.dataset.i)));
    showClub(0);
    const NOTE_AT = ["2025-04-05", "2025-05-25", "2026-08-28"];
    $("#clubReviews").innerHTML = D.TALKS.filter(t => NOTE_AT.includes(t[0])).map(t => `<blockquote class="rvcard">${esc(t[6])}<cite>${esc(dot(t[0]))} · 『${esc(t[1])}』 북토크 날</cite></blockquote>`).join("");

    $("#calTitle").textContent = `기억의 숲 · ${M}월`; $("#calYear").textContent = Y;
    const evs = {}; const add = (d, k, l) => { if (d >= 1 && d <= 31) (evs[d] ||= []).push([k, l]); };
    for (const [k, txt] of last.m || []) {
      for (const m of txt.matchAll(/(\d{1,2})\/(\d{1,2})/g)) if (+m[1] === M) add(+m[2], k);
      for (const m of txt.matchAll(/(?<![\d\/])(\d{1,2})일/g)) add(+m[1], k);
    }
    for (const [d, txt] of last.e || []) {
      const m = d.match(/^(\d{1,2})\/(\d{1,2})$/); if (!m || +m[1] !== M) continue;
      const r = txt.match(/~\s?(\d{1,2})\/(\d{1,2})/), end = r ? +r[2] : +m[2];
      const lab = /북스팟/.test(txt) ? "북스팟" : /도서전/.test(txt) ? "도서전" : "행사";
      for (let x = +m[2]; x <= end; x++) add(x, "ev", lab);
    }
    const first = new Date(Y, M - 1, 1).getDay(), days = new Date(Y, M, 0).getDate();
    let h = ["일", "월", "화", "수", "목", "금", "토"].map(d => `<div class="dow">${d}</div>`).join("") + "<div></div>".repeat(first);
    for (let d = 1; d <= days; d++) {
      const sun = (first + d - 1) % 7 === 0;
      const cell = (evs[d] || []).map(([k, l]) => {
        const b = NOWBOOK[k];
        return b ? `<span class="ev">${cover(b[0], "", COL[k])}<span class="ev__t">${esc(SHORT[k])}</span></span>`
                 : `<span class="ev ev--mark" style="--c:${COL[k] || "#868069"}"><span class="ev__mk">${esc((l || SHORT[k] || "").slice(0, 2))}</span><span class="ev__t">${esc(l || SHORT[k])}</span></span>`;
      }).join("");
      h += `<div class="${sun ? "off" : ""}">${d}${sun ? "<small>쉼</small>" : ""}${cell}</div>`;
    }
    $("#calGrid").innerHTML = h;
    $("#monthList").innerHTML = (last.m || []).map(([k, t]) => `<li>${chip(k)} ${esc(t)}</li>`).join("") + (last.e || []).map(([d, t]) => `<li>${chip("ev")} ${esc(d)} ${esc(t)}</li>`).join("");
    $("#monthNote").textContent = last.n || "";

    const SH = Object.assign({}, D.SHELVES, { w: "자유로운 글쓰기" });
    const BOOKS = D.BOOKS.concat([["하버드 글쓰기 강의", "바버라 베이그", "w"], ["유혹하는 글쓰기", "스티븐 킹", "w"]]);
    const SHCOL = { g: ["#733A12", "#8A4A1E", "#5E2F0F", "#994D18"], n: ["#994D18", "#B5652C", "#7E3F14"], b: ["#6E8650", "#839A61", "#5B7343"], s: ["#BBC99B", "#C9D4AE", "#A9BB86"], d: ["#A0703F", "#8C5E3D", "#B88555"], w: ["#868069", "#757058"] };
    const ORDER = ["all", "n", "b", "s", "d", "w", "g"];
    const LABEL = { all: "전체", n: "낭독&필사", b: "벽돌책", s: "맘편한 모임", d: "번데기", w: "자유로운 글쓰기", g: "월 한 권 고전" };
    let cat = "all", open = false;
    $("#bookCount").textContent = `함께 읽은 책 ${BOOKS.length}권`;
    $("#bookChips").innerHTML = ORDER.map(k => `<button class="chip" role="tab" data-k="${k}" aria-selected="${k === "all"}">${LABEL[k]} <span class="soft">${k === "all" ? BOOKS.length : BOOKS.filter(b => b[2].includes(k)).length}</span></button>`).join("");
    const MIX = ["#733A12", "#6E8650", "#994D18", "#A0703F", "#868069", "#BBC99B", "#5E2F0F", "#839A61", "#B5652C"];
    const colorOf = (b, i) => { if (cat === "all") return MIX[i % MIX.length]; const k = [...b[2]][0], pal = SHCOL[k] || ["#868069"]; return pal[i % pal.length]; };
    const drawBooks = () => {
      const list = BOOKS.filter(b => cat === "all" || b[2].includes(cat));
      const box = $("#covers");
      box.innerHTML = list.map((b, i) => `<button class="bk" type="button" data-t="${esc(b[0])}" aria-pressed="false">${cover(b[0], b[1], colorOf(b, i))}<span class="bk__meta">${esc([...b[2]].map(k => SH[k]).join(" · "))}</span><span class="bk__title">${esc(b[0])}</span><span class="bk__by">${esc(b[1])}</span></button>`).join("");
      box.classList.toggle("clip", !open);
      const visible = innerWidth <= 640 ? 6 : innerWidth <= 1000 ? 8 : 12;
      const mb = $("#moreBooks"); mb.hidden = list.length <= visible;
      mb.textContent = open ? "접기" : `전체 보기 (${list.length}권)`; mb.setAttribute("aria-expanded", open);
      $$(".bk", box).forEach(x => x.addEventListener("click", () => showNote(x.dataset.t)));
    };
    const showNote = t => {
      const b = BOOKS.find(x => x[0] === t); if (!b) return;
      const n = D.BOOK_NOTES[t], box = $("#bookNote"); box.hidden = false;
      box.innerHTML = `<span class="tape"></span>${cover(b[0], b[1], colorOf(b, 0))}<p class="k">책방지기의 책 쪽지 · ${esc([...b[2]].map(k => SH[k]).join(" · "))}</p><b>『${esc(b[0])}』 <span class="soft" style="font-size:15px;font-weight:400">${esc(b[1])}</span></b>` +
        (n ? `<span class="when">${esc(n[0])}</span><p>${esc(n[1])}</p>` : `<p class="soft">책방지기 쪽지가 아직 없는 책이에요.</p>`);
      $$(".bk").forEach(x => x.setAttribute("aria-pressed", x.dataset.t === t));
      box.scrollIntoView({ block: "nearest", behavior: REDUCED ? "auto" : "smooth" });
    };
    $$("#bookChips .chip").forEach(x => x.addEventListener("click", () => { cat = x.dataset.k; open = false; $$("#bookChips .chip").forEach(y => y.setAttribute("aria-selected", y === x)); drawBooks(); }));
    $("#moreBooks").addEventListener("click", () => { open = !open; drawBooks(); });
    drawBooks();

    $("#dropList").innerHTML = D.DROP.filter(x => !/기억 엽서/.test(x.t)).map(x => `<div class="paper"><em>${esc(x.tag)}</em><b>${esc(x.t)}</b>${esc(x.d)}</div>`).join("");

    const shots = ["P01", "P02", "P03", "P04", "P05", "P07", "P08", "P06", "P11"];
    $("#vfilm").innerHTML = [...shots, ...shots].map(s => `<img src="사진/${s}.jpg" alt="" loading="lazy">`).join("");

    $("#progs").innerHTML = D.PROGRAMS.map(p => `<li class="rv"><span class="v6__thumb">행사<br>사진</span><div class="v6__name">${esc(p.t)}<small>${esc(p.when || "")}</small></div><p class="v6__desc">${esc(p.d)} ${(p.links || []).slice(0, 1).map(l => `<a href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])} ↗</a>`).join("")}</p></li>`).join("");
    const TCOL = ["#733A12", "#6E8650", "#994D18", "#868069", "#A0703F", "#5E2F0F", "#839A61", "#B5652C", "#757058"];
    $("#talkRows").innerHTML = D.TALKS.map((t, i) => {
      const ttl = t[5] ? `<a href="https://blog.naver.com/jsn4577/${esc(t[5])}" target="_blank" rel="noopener">『${esc(t[1])}』</a>` : `『${esc(t[1])}』`;
      return `<li class="rv">${cover(t[1], "", TCOL[i % TCOL.length])}<div class="v6__name">${ttl}<small>${esc(dot(t[0]))} · ${esc(t[3])}</small></div><p class="v6__desc">${esc(t[6] || t[4])}</p></li>`;
    }).join("");

    const PT = ["#EFE6D4", "#E4EBDD", "#F3E4D6", "#E8E2C2"];
    $("#clips").innerHTML = D.PRESS.map((p, i) => `<article class="press18__card rv"><div class="press18__thumb" style="--tone:${PT[i % 4]}"><span>${esc(p.outlet.split(/[·(]/)[0].trim())}</span></div><div class="press18__body"><p class="meta">${esc(p.d)} · ${esc(p.k)}</p><h3>${esc(p.t)}</h3><p>${esc(p.s)}</p>${p.link ? `<a class="link small" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.go || "보기")} ↗</a>` : ""}</div></article>`).join("");

    const KINDS = [["후기", "#C95D3E"], ["소식", "#6E8650"], ["이야기", "#4A6A8A"]];
    $("#diaryFolders").innerHTML = KINDS.map(([k, c]) => {
      const items = D.DIARY.filter(x => x[1] === k).slice(0, 5);
      return `<div class="folder rv"><span class="folder__tab"></span><div class="folder__body"><span class="folder__stamp" style="--c:${c}"></span><ul>${items.map(x => `<li><time>${esc(dot(x[0]))}</time>${esc(x[2])}</li>`).join("") || "<li>곧 적어요</li>"}</ul></div><p class="folder__label">${k}</p></div>`;
    }).join("");

    watch(); shot();
    if (PIN) { piecesScroll(); ScrollTrigger.refresh(); } else piecesReveal();
  }).catch(err => { console.error("내용.json", err); watch(); piecesReveal(); });
  watch(); shot();

  
  function shot() {
    if (!SHOT) return;
    if (!$("#shotStyle")) document.head.insertAdjacentHTML("beforeend", "<style id='shotStyle'>.rv,.piece{transition:none!important}main{padding-top:110px}</style>");
    $$(".rv").forEach(e => e.classList.add("in")); $$(".piece").forEach(p => p.classList.remove("hide"));
    $$("main > section, main > .chapter, footer").forEach(s => { if (s.id !== SHOT) s.style.display = "none"; });
    bar.classList.add("solid");
  }
})();
