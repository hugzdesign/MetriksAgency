(function () {
  "use strict";

  var D = window.METRIKS;
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 901px)");
  var hasGsap = typeof window.gsap !== "undefined";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var posterSrc = function (p, w) { return "assets/img/posters/" + p.file + "-" + w + ".webp"; };
  var LABELS = {
    "jour-de-match": "Jour de match", "groupe": "Le groupe", "compo1": "Composition", "compo2": "Composition, variante",
    "coup-d-envoi": "Coup d'envoi", "mi-temps": "Mi-temps", "goal": "But", "goal2": "But, variante", "goal3": "But, variante 2",
    "victoire": "Victoire", "victoire-2": "Victoire, variante", "fin-du-match": "Fin du match", "prochain-match": "Prochain match",
    "matchday": "Matchday", "nextmatch": "Prochain match", "versailles-compo": "Le onze", "versailles-compo1": "Le onze, trombinoscope",
    "goal-story": "But, story", "goal-story2": "But, story variante", "gametime-stb": "Gametime", "next-game": "Next game",
    "score-du-match": "Score final", "potm": "Player of the game", "compo-publication": "Starters, post", "calendrier": "Calendrier",
    "post-insta": "Annonce rebranding", "compo-story": "Starters, story", "stb-compo-story": "Starters, story variante"
  };
  var label = function (f) { return LABELS[f] || f.replace(/-/g, " "); };
  var clubSrc = function (c, f, w) { return "assets/img/clubs/" + c.id + "-" + f + "-" + w + ".webp"; };

  /* ------------------------------------------------------------------ */
  /* Build : bandeau d'affiches (section clubs)                          */
  /* ------------------------------------------------------------------ */
  var reelTrack = $("[data-reel-track]");
  var matchdayList = D.posters.map(function (p) {
    return { src: posterSrc(p, 1280), caption: p.title + " · " + p.sport };
  });
  var posterFig = function (p, i, hidden) {
    var tall = p.ratio > 1.3;
    return '<figure class="poster' + (tall ? " poster--tall" : "") + '"' + (hidden ? ' aria-hidden="true"' : ' tabindex="0" role="button" aria-label="Agrandir : ' + esc(p.title) + '"') + ' data-lb="matchday" data-i="' + i + '">' +
      '<img src="' + posterSrc(p, 640) + '" alt="' + (hidden ? "" : "Affiche " + esc(p.title) + " (" + esc(p.sport) + ")") + '" loading="lazy" decoding="async" width="640" height="' + (tall ? 1138 : 800) + '">' +
      '<figcaption><b>' + esc(p.title) + '</b><span>' + esc(p.sport) + '</span></figcaption></figure>';
  };
  reelTrack.innerHTML = D.posters.map(function (p, i) { return posterFig(p, i, false); }).join("") +
    D.posters.map(function (p, i) { return posterFig(p, i, true); }).join("");

  /* ------------------------------------------------------------------ */
  /* Build : identités                                                   */
  /* ------------------------------------------------------------------ */
  var tabs = $(".ids__tabs");
  tabs.innerHTML = D.clubs.map(function (c, i) {
    return '<button class="ids__tab" role="tab" id="tab-' + c.id + '" aria-controls="club-panel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-club="' + i + '">' +
      '<span>' + esc(c.name) + '<br><small>' + esc(c.sport) + ' · ' + (c.files.length + c.stories.length) + ' formats</small></span>' +
      '<img src="assets/img/logos/' + c.logo + '" alt="" width="34" height="34"></button>';
  }).join("");
  var grid = $("[data-club-grid]");
  grid.id = "club-panel";
  grid.setAttribute("role", "tabpanel");
  var clubList = [];
  var CLUB_VISIBLE = 6;
  var currentClub = -1;

  function renderClub(i, animate) {
    if (i === currentClub) return;
    currentClub = i;
    var c = D.clubs[i];
    $$(".ids__tab").forEach(function (t, j) {
      t.setAttribute("aria-selected", String(j === i));
      t.tabIndex = j === i ? 0 : -1;
    });
    grid.setAttribute("aria-labelledby", "tab-" + c.id);
    var all = c.files.map(function (f) { return { f: f, tall: false }; })
      .concat(c.stories.map(function (f) { return { f: f, tall: true }; }));
    clubList = all.map(function (o) {
      return { src: clubSrc(c, o.f, 1280), caption: c.name + " · " + label(o.f) };
    });

    var swap = function () {
      $(".ids__logo").src = "assets/img/logos/" + c.logo;
      $(".ids__logo").alt = "Logo " + c.name;
      $("[data-club-name]").textContent = c.name;
      $("[data-club-sport]").textContent = c.sport + " · Rebranding";
      $("[data-club-desc]").textContent = c.desc;
      $("[data-club-count]").textContent = String(all.length);
      $("[data-club-kinds]").textContent = c.stories.length ? "Post · Story" : "Post";
      $("[data-club-all]").textContent = "Voir les " + all.length + " formats";
      grid.innerHTML = all.slice(0, CLUB_VISIBLE).map(function (o, j) {
        return '<figure class="poster' + (o.tall ? " poster--tall" : "") + '" tabindex="0" role="button" aria-label="Agrandir le visuel ' + (j + 1) + '" data-lb="club" data-i="' + j + '">' +
          '<img src="' + clubSrc(c, o.f, 640) + '" alt="' + esc(c.name) + ' : ' + esc(label(o.f)) + '" loading="lazy" decoding="async" width="640" height="' + (o.tall ? 1138 : 800) + '">' +
          '<figcaption><b>' + esc(label(o.f)) + '</b><span>' + esc(c.short) + '</span></figcaption></figure>';
      }).join("");
      if (hasGsap && !reduce && animate) {
        gsap.fromTo(grid.children, { y: 40, opacity: 0, clipPath: "inset(12% 0 0 0)" },
          { y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: "expo.out", stagger: 0.045 });
        gsap.fromTo(".ids__card > *", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.04 });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };

    if (hasGsap && !reduce && animate) {
      gsap.to(grid.children, { y: -20, opacity: 0, duration: 0.25, ease: "power2.in", stagger: 0.015, onComplete: swap });
    } else swap();
  }
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest(".ids__tab");
    if (b) renderClub(+b.dataset.club, true);
  });
  tabs.addEventListener("keydown", function (e) {
    var dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    var n = (currentClub + dir + D.clubs.length) % D.clubs.length;
    renderClub(n, true);
    $$(".ids__tab")[n].focus();
  });
  renderClub(0, false);

  /* ------------------------------------------------------------------ */
  /* Build : projets web                                                 */
  /* ------------------------------------------------------------------ */
  function mock(p) {
    var host = p.url ? p.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : p.slug + ".fr";
    return '<div class="mock" style="--a:' + p.tone[0] + ';--b:' + p.tone[1] + ';--c:' + p.tone[2] + '">' +
      '<div class="mock__bar"><i></i><i></i><i></i><span>' + esc(host) + '</span></div>' +
      '<div class="mock__nav"><span>' + esc(p.name) + '</span><em><span>Services</span><span>Réalisations</span><span>Contact</span></em></div>' +
      '<div class="mock__hero"><div><h4>' + esc(p.headline || p.sector) + '</h4><p>' + esc(p.sector) + ' · ' + esc(p.place) + '</p><span class="mock__btn">Demander un devis</span></div><div class="mock__img"></div></div>' +
      '<div class="mock__cards"><i></i><i></i><i></i></div></div>';
  }
  function thumb(p) {
    return p.captures && p.captures.length
      ? '<img src="assets/img/web/' + p.captures[0] + '" alt="Capture du site ' + esc(p.name) + '" loading="lazy">'
      : mock(p);
  }
  var projectsEl = $("[data-projects]");
  function renderProjects() {
    projectsEl.innerHTML = D.projects.map(function (p, i) {
      var tag = p.url ? "a" : "div";
      var attrs = p.url ? ' href="' + esc(p.url) + '" target="_blank" rel="noopener"' : "";
      return '<li class="project"><' + tag + ' class="project__row' + (p.url ? "" : " is-nolink") + '"' + attrs + ' data-p="' + i + '">' +
        '<span class="project__name">' + esc(p.name) + '</span>' +
        '<span class="project__meta"><span class="project__sector">' + esc(p.sector) + '</span><span class="project__place">' + esc(p.place) + '</span></span>' +
        '<span class="project__go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg></span>' +
        (p.url ? '<span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"> (nouvel onglet)</span>' : "") +
        '<span class="project__thumb" aria-hidden="true">' + thumb(p) + '</span>' +
        '</' + tag + '></li>';
    }).join("");
  }
  renderProjects();
  $$("[data-mock]").forEach(function (el) { var p = D.projects[+el.dataset.mock]; if (p) el.innerHTML = thumb(p); });


  /* ------------------------------------------------------------------ */
  /* Lightbox                                                            */
  /* ------------------------------------------------------------------ */
  var lb = $(".lightbox");
  var lbImg = $("img", lb), lbCap = $("figcaption", lb);
  var lbList = [], lbIndex = 0;
  function lbShow(i) {
    lbIndex = (i + lbList.length) % lbList.length;
    var it = lbList[lbIndex];
    lbImg.src = it.src;
    lbImg.alt = it.caption;
    lbCap.textContent = it.caption + "  —  " + pad(lbIndex + 1) + " / " + pad(lbList.length);
    if (hasGsap && !reduce) gsap.fromTo(lbImg, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" });
  }
  function lbOpen(list, i) {
    lbList = list;
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
    if (window.__lenis) window.__lenis.stop();
    lbShow(i);
  }
  function lbClose() {
    if (lb.open) lb.close();
  }
  lb.addEventListener("close", function () { if (window.__lenis) window.__lenis.start(); });
  $(".lightbox__close").addEventListener("click", lbClose);
  $(".lightbox__nav--prev").addEventListener("click", function () { lbShow(lbIndex - 1); });
  $(".lightbox__nav--next").addEventListener("click", function () { lbShow(lbIndex + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "FIGURE") lbClose(); });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") lbShow(lbIndex + 1);
    if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
  });
  $("[data-club-all]").addEventListener("click", function () { lbOpen(clubList, 0); });
  function openFrom(el) {
    var list = el.dataset.lb === "club" ? clubList : matchdayList;
    lbOpen(list, +el.dataset.i);
  }
  document.addEventListener("click", function (e) {
    var f = e.target.closest("[data-lb]");
    if (f) openFrom(f);
  });
  document.addEventListener("keydown", function (e) {
    var f = e.target.closest && e.target.closest("[data-lb]");
    if (f && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openFrom(f); }
  });

  /* ------------------------------------------------------------------ */
  /* Divers : menu, copie, année                                         */
  /* ------------------------------------------------------------------ */
  var burger = $(".bug__burger"), menu = $("#menu");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    document.body.classList.toggle("menu-open", open);
    if (open) {
      menu.hidden = false;
      if (window.__lenis) window.__lenis.stop();
      if (hasGsap && !reduce) {
        gsap.fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "expo.out" });
        gsap.fromTo("#menu a", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.05, delay: 0.1 });
      }
    } else {
      if (window.__lenis) window.__lenis.start();
      if (hasGsap && !reduce) {
        gsap.to(menu, { clipPath: "inset(0 0 100% 0)", duration: 0.5, ease: "expo.in", onComplete: function () { menu.hidden = true; } });
      } else menu.hidden = true;
    }
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  var copyBtn = $("[data-copy]");
  copyBtn.addEventListener("click", function () {
    var label = $("[data-copy-label]", copyBtn);
    var done = function () {
      label.textContent = "Adresse copiée";
      setTimeout(function () { label.textContent = copyBtn.dataset.copy; }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(copyBtn.dataset.copy).then(done, function () { window.location.href = "mailto:" + copyBtn.dataset.copy; });
    else window.location.href = "mailto:" + copyBtn.dataset.copy;
  });
  $("[data-year]").textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* Three.js : anneaux de tribunes                                      */
  /* ------------------------------------------------------------------ */
  var hero = $(".hero");
  var scene = null;
  var webgl = (function () {
    try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  })();
  // En ouverture locale (file://), le navigateur bloque les textures WebGL : on affiche la version fixe.
  if (location.protocol === "file:") {
    webgl = false;
    console.info("MetriKs : lancez un serveur local pour voir le stade 3D (voir LISEZ-MOI.txt).");
  }
  // Galerie 3D : écrans des sites clients entrecoupés d'affiches (2 écrans pour 1 affiche)
  var galleryItems = [];
  var pi = 0;
  var posterPick = [0, 3, 6, 9, 7, 1, 11, 14];
  for (var v = 0; v < 6; v++) {
    D.projects.forEach(function (p, k) {
      galleryItems.push({ type: "screen", project: p, variant: (v + k) % 3 });
      if ((v * D.projects.length + k) % 2 === 1) {
        var idx = posterPick[pi++ % posterPick.length];
        var pp = D.posters[idx];
        galleryItems.push({ type: "poster", file: pp.file, ratio: pp.ratio, index: idx });
      }
    });
  }
  var introReady = false;
  function startScene() {
    var cs = getComputedStyle(root);
    scene = window.MetriksScene.init($(".hero__gl"), galleryItems, {
      host: hero,
      bg: cs.getPropertyValue("--ink").trim(),
      accent: cs.getPropertyValue("--signal").trim(),
      onSelect: function (it) {
        if (it.type === "poster") lbOpen(matchdayList, it.index);
        else if (window.__lenis) window.__lenis.scrollTo("#realisations", { duration: 1.6 });
        else location.hash = "#realisations";
      }
    });
    if (!scene) { root.classList.add("no-webgl"); return; }
    if (reduce || !hasGsap) { scene.staticMode(); scene.setIntro(1); }
    else if (introReady) scene.playIntro(0);
    // Pause du rendu 3D quand le hero n'est plus à l'écran
    var sync = function () {
      var st = window.__heroST;
      var limit = st ? st.end + window.innerHeight : window.innerHeight * 2.2;
      scene.running = (window.scrollY || document.documentElement.scrollTop) < limit;
    };
    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }
  if (webgl && window.MetriksScene) {
    // Les écrans sont dessinés avec les polices du site : on attend qu'elles soient prêtes.
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(startScene);
  } else root.classList.add("no-webgl");

  /* ------------------------------------------------------------------ */
  /* Sans GSAP ou mouvement réduit : on s'arrête là                      */
  /* ------------------------------------------------------------------ */
  var curtain = $(".curtain");
  if (!hasGsap || reduce) {
    curtain.remove();
    initProgress(null);
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* Lenis */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var t = $(id);
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: id === "#top" ? 0 : -10, duration: 1.4 });
        history.replaceState(null, "", id);
      });
    });
  }

  /* Intro */
  document.body.classList.add("is-loading");
  if (lenis) lenis.stop();
  gsap.set(".hero__title .line > span", { yPercent: 110 });
  gsap.set([".hero__lead", ".hero__actions", ".hero__ticker"], { opacity: 0, y: 24 });
  gsap.set(".bug", { yPercent: -160 });

  var intro = gsap.timeline({
    defaults: { ease: "expo.out" },
    onComplete: function () {
      document.body.classList.remove("is-loading");
      if (lenis) lenis.start();
    }
  });
  intro
    .from(".curtain__word span", { yPercent: 110, duration: 0.9, stagger: 0.06 })
    .to(".curtain__bar i", { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, 0.1)
    .to(".curtain__word .k", { rotate: -8, scale: 1.12, duration: 0.5, ease: "back.out(3)" }, 0.75)
    .to(".curtain", { clipPath: "inset(0 0 100% 0)", duration: 1.0, ease: "expo.inOut" }, 1.1)
    .add(function () { curtain.style.pointerEvents = "none"; }, 1.3)
    .add(function () { introReady = true; if (scene) scene.playIntro(0); }, 1.1)
    .to(".hero__title .line > span", { yPercent: 0, duration: 1.2, stagger: 0.09 }, 1.5)
    .to([".hero__lead", ".hero__actions", ".hero__ticker"], { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 1.9)
    .to(".bug", { yPercent: 0, duration: 1 }, 1.9)
    .add(function () { curtain.remove(); });

  /* Hero : défilement → la caméra s'élève au-dessus du stade */
  var heroTl = gsap.timeline({
    scrollTrigger: {
      id: "hero",
      trigger: hero, start: "top top", end: "+=110%", pin: true, scrub: true, anticipatePin: 1,
      onUpdate: function (s) { if (scene) scene.setProgress(s.progress); }
    }
  });
  heroTl
    .to(".hero__inner", { yPercent: -14, opacity: 0, ease: "power1.in", duration: 0.45 }, 0)
    .to(".hero__ticker", { opacity: 0, duration: 0.2 }, 0)
    .to(".hero__shade", { opacity: 0.55, duration: 0.6 }, 0.2)
    .fromTo(".hero__aerial", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, 0.62)
    .to({}, { duration: 0.2 });
  window.__heroST = heroTl.scrollTrigger;
  if (lenis && scene) lenis.on("scroll", function (l) { scene.kick(Math.min(Math.abs(l.velocity) * 0.012, 0.25)); });

  /* Barre de progression + en-tête */
  initProgress(lenis);

  var bug = $(".bug");
  var lastY = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: function (s) {
      var y = s.scroll();
      var down = y > lastY;
      bug.classList.toggle("is-hidden", down && y > window.innerHeight * 0.9 && menu.hidden);
      lastY = y;
    }
  });

  /* Secteurs qui défilent dans le hero */
  var rotEl = $("[data-rotator]");
  if (rotEl && D.sectors && D.sectors.length > 1) {
    var ri = 0;
    setInterval(function () {
      if (document.hidden) return;
      var cur = rotEl.firstElementChild;
      ri = (ri + 1) % D.sectors.length;
      var next = document.createElement("span");
      next.textContent = D.sectors[ri];
      next.style.position = "absolute"; next.style.left = "0"; next.style.top = "0";
      rotEl.appendChild(next);
      gsap.to(rotEl, { width: next.offsetWidth, duration: 0.6, ease: "expo.inOut" });
      gsap.fromTo(next, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "expo.inOut" });
      gsap.to(cur, { yPercent: -100, duration: 0.6, ease: "expo.inOut", onComplete: function () {
        cur.remove(); next.style.position = ""; next.style.left = ""; next.style.top = "";
      } });
    }, 2200);
  }

  /* Titres : révélation ligne à ligne */
  document.fonts.ready.then(function () {
    $$(".split").forEach(function (el) {
      var split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "sl" });
      gsap.from(split.lines, {
        yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });
    ScrollTrigger.refresh();
  });

  /* Bandeau : accélère avec le scroll */
  var band = $(".band__track");
  if (lenis) {
    var bandAnim = band.getAnimations ? band.getAnimations()[0] : null;
    lenis.on("scroll", function (l) {
      if (bandAnim) bandAnim.playbackRate = 1 + Math.min(Math.abs(l.velocity) * 0.08, 5);
    });
  }

  /* Services */
  gsap.from(".sectors__list li", {
    y: 16, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.05, clearProps: "transform,opacity",
    scrollTrigger: { trigger: ".sectors", start: "top 85%" }
  });
  ScrollTrigger.batch(".offer__item", {
    start: "top 88%",
    onEnter: function (els) { gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.08, overwrite: true }); }
  });
  gsap.from(".services__screens", {
    y: 60, opacity: 0, duration: 1.2, ease: "expo.out",
    scrollTrigger: { trigger: ".services__screens", start: "top 90%" }
  });

  /* Clubs : le bandeau accélère avec le scroll */
  var reelAnim = reelTrack.getAnimations ? reelTrack.getAnimations()[0] : null;
  if (lenis && reelAnim) lenis.on("scroll", function (l) { reelAnim.playbackRate = 1 + Math.min(Math.abs(l.velocity) * 0.06, 4); });

  /* Identités */
  gsap.from(".ids__tabs", { y: 30, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".ids__tabs", start: "top 85%" } });
  ScrollTrigger.batch(".ids__grid .poster", {
    start: "top 90%",
    onEnter: function (els) { gsap.fromTo(els, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.06, overwrite: true }); }
  });

  /* Projets : aperçu qui suit le curseur */
  var preview = $(".preview"), previewInner = $(".preview__inner");
  var px = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
  var py = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
  var rot = gsap.quickTo(preview, "rotation", { duration: 0.8, ease: "power3" });
  var lastPX = 0;
  projectsEl.addEventListener("mousemove", function (e) {
    px(e.clientX + 40); py(e.clientY);
    rot(gsap.utils.clamp(-8, 8, (e.clientX - lastPX) * 0.4));
    lastPX = e.clientX;
  });
  projectsEl.addEventListener("mouseover", function (e) {
    var row = e.target.closest(".project__row");
    if (!row || row.__over) return;
    $$(".project__row", projectsEl).forEach(function (r) { r.__over = r === row; });
    previewInner.innerHTML = thumb(D.projects[+row.dataset.p]);
    gsap.to(preview, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" });
  });
  projectsEl.addEventListener("mouseleave", function () {
    $$(".project__row", projectsEl).forEach(function (r) { r.__over = false; });
    gsap.to(preview, { opacity: 0, scale: 0.9, duration: 0.4, ease: "expo.out" });
  });
  gsap.from(".project", {
    y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08,
    scrollTrigger: { trigger: ".projects", start: "top 85%" }
  });
  /* Méthode : la ligne se remplit, les étapes s'allument */
  var steps = $$(".step");
  gsap.to("[data-timeline]", {
    scaleX: 1, ease: "none",
    scrollTrigger: {
      trigger: ".timeline", start: "top 75%", end: "bottom 55%", scrub: 0.5,
      onUpdate: function (s) {
        steps.forEach(function (st, i) { st.classList.toggle("is-on", s.progress >= i / steps.length - 0.001 && s.progress > 0.01); });
      }
    }
  });
  gsap.from(".step", {
    y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1,
    scrollTrigger: { trigger: ".timeline", start: "top 80%" }
  });

  /* Contact */
  gsap.from(".contact__body > *", {
    y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1,
    scrollTrigger: { trigger: ".contact__body", start: "top 90%" }
  });
  gsap.fromTo(".foot__giant", { yPercent: 40 }, {
    yPercent: 0, ease: "none",
    scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true }
  });

  /* Lien actif */
  $$(".bug__nav a").forEach(function (a) {
    var t = $(a.getAttribute("href"));
    if (!t) return;
    ScrollTrigger.create({
      trigger: t, start: "top 50%", end: "bottom 50%",
      onToggle: function (s) { a.classList.toggle("is-active", s.isActive); }
    });
  });

  /* Recalcul après chargement des images */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  /* ------------------------------------------------------------------ */
  function initProgress(lenisRef) {
    var bar = $("[data-progress-page]");
    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY || document.documentElement.scrollTop;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    };
    if (lenisRef) lenisRef.on("scroll", update);
    else window.addEventListener("scroll", update, { passive: true });
    update();
  }
})();
