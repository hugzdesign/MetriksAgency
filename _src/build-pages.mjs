// Générateur des pages du site MetriKs.
// Les textes de chaque page sont écrits ici ; la commande
//   node _src/build-pages.mjs
// régénère index.html et les dossiers de pages à la racine du site.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://metriksagency.com/";
const TODAY = new Date().toISOString().slice(0, 10);

// Données partagées avec le navigateur (projets, affiches, clubs)
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "assets/js/data.js"), "utf8"), sandbox);
const D = sandbox.window.METRIKS;

/* ------------------------------------------------------------------ */
/* Petits outils                                                       */
/* ------------------------------------------------------------------ */
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
const hl = (t) => `<strong class="hl">${t}</strong>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const strip = (s) => s.replace(/<[^>]+>/g, "");
const EMAIL = "contact@metriksagency.com";
const MAILTO = "mailto:contact@metriksagency.com?subject=Diagnostic%20offert%20-%20MetriKs&amp;body=Bonjour%2C%0A%0AJe%20souhaite%20r%C3%A9server%20un%20diagnostic%20offert.%0A%0AEntreprise%20%3A%20%0AActivit%C3%A9%20%3A%20%0AVille%20%3A%20%0ASite%20actuel%20(s%27il%20existe)%20%3A%20%0AT%C3%A9l%C3%A9phone%20%3A%20%0A";

const SERVICES = [
  { slug: "creation-site-internet", name: "Création de site internet", menu: "Création de site", line: "Un site qui vous ressemble et qui donne envie de vous appeler." },
  { slug: "refonte-site-internet", name: "Refonte de site", menu: "Refonte de site", line: "Pour donner l'adresse de votre site sans jamais hésiter." },
  { slug: "referencement-local", name: "Référencement local", menu: "Référencement local", line: "Quand on cherche votre métier près de chez soi, on tombe sur vous." },
  { slug: "identite-visuelle", name: "Identité visuelle", menu: "Identité visuelle", line: "Une image qu'on reconnaît, de l'enseigne à la carte de visite." },
];

const btn = (href, label, kind = "signal", extra = "") =>
  `<a class="btn btn--${kind}" href="${href}"${extra}><span>${label}</span>${kind === "line" ? "" : ARROW}</a>`;

// Cadran : le même motif que le sol de la galerie 3D de l'accueil
function dial() {
  const c = 500;
  let ticks = "";
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const big = i % 10 === 0;
    const r1 = 480, r2 = big ? 446 : 466;
    ticks += `<line x1="${(c + Math.cos(a) * r1).toFixed(1)}" y1="${(c + Math.sin(a) * r1).toFixed(1)}" x2="${(c + Math.cos(a) * r2).toFixed(1)}" y2="${(c + Math.sin(a) * r2).toFixed(1)}"${big ? ' class="b"' : ""}/>`;
  }
  const arc = (r, a0, a1) => {
    const p = (a) => `${(c + Math.cos(a) * r).toFixed(1)} ${(c + Math.sin(a) * r).toFixed(1)}`;
    return `M${p(a0)} A${r} ${r} 0 0 1 ${p(a1)}`;
  };
  return `<svg class="dial" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
      <g class="dial__rings"><circle cx="500" cy="500" r="480"/><circle cx="500" cy="500" r="400" class="b"/><circle cx="500" cy="500" r="262" class="d"/><circle cx="500" cy="500" r="126"/>
      <path d="M100 500H900M500 100V900"/></g>
      <g class="dial__ticks">${ticks}</g>
      <path class="dial__arc" d="${arc(497, Math.PI * 0.84, Math.PI * 1.16)}"/>
    </svg>`;
}

/* ------------------------------------------------------------------ */
/* Blocs communs                                                       */
/* ------------------------------------------------------------------ */
function header(B, current) {
  const is = (k) => (current === k ? ' class="is-active" aria-current="page"' : "");
  const svcCurrent = SERVICES.some((s) => s.slug === current);
  return `<header class="bug">
    <a class="bug__brand" href="${B || "./"}" aria-label="MetriKs, accueil">
      <span class="wordmark">Metri<span class="k">K</span>s</span>
    </a>
    <nav class="bug__nav" aria-label="Navigation principale">
      <div class="drop">
        <a class="drop__btn${svcCurrent ? " is-active" : ""}" href="${B}#services">Services<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></a>
        <div class="drop__panel">
          <ul>
${SERVICES.map((s) => `            <li><a href="${B}${s.slug}/"${current === s.slug ? ' aria-current="page"' : ""}><strong>${s.name}</strong><small>${s.line}</small></a></li>`).join("\n")}
          </ul>
        </div>
      </div>
      <a href="${B}realisations/"${is("realisations")}>Réalisations</a>
      <a href="${B}methode/"${is("methode")}>Méthode</a>
      <a href="${B}clubs-sportifs/"${is("clubs-sportifs")}>Clubs sportifs</a>
    </nav>
    <a class="bug__cta" href="${B}contact/">Diagnostic offert</a>
    <button class="bug__burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Ouvrir le menu">
      <i></i><i></i>
    </button>
    <span class="bug__progress" aria-hidden="true"><i data-progress-page></i></span>
  </header>

  <div class="menu" id="menu" hidden>
    <nav aria-label="Menu mobile">
      <a href="${B || "./"}">Accueil</a>
      <p class="menu__label">Services</p>
      <div class="menu__svc">
${SERVICES.map((s) => `        <a href="${B}${s.slug}/">${s.menu}</a>`).join("\n")}
      </div>
      <a href="${B}realisations/">Réalisations</a>
      <a href="${B}methode/">Méthode</a>
      <a href="${B}clubs-sportifs/">Clubs sportifs</a>
      <a href="${B}contact/">Contact</a>
    </nav>
  </div>`;
}

function footer(B) {
  return `<footer class="foot">
    <div class="wrap foot__grid">
      <div class="foot__brand">
        <a class="wordmark" href="${B || "./"}">Metri<span class="k">K</span>s</a>
        <p>Agence web basée à Montivilliers, près du Havre. Sites internet et identités visuelles pour des clients partout en France.</p>
      </div>
      <nav class="foot__col" aria-label="Services">
        <p>Services</p>
${SERVICES.map((s) => `        <a href="${B}${s.slug}/">${s.name}</a>`).join("\n")}
      </nav>
      <nav class="foot__col" aria-label="Agence">
        <p>Agence</p>
        <a href="${B}realisations/">Réalisations</a>
        <a href="${B}methode/">Méthode et espace client</a>
        <a href="${B}clubs-sportifs/">Clubs sportifs</a>
        <a href="${B}contact/">Diagnostic offert</a>
      </nav>
      <div class="foot__col">
        <p>Contact</p>
        <a href="mailto:${EMAIL}">${EMAIL}</a>
        <span>Montivilliers (76290), près du Havre</span>
        <span>Rendez-vous sur place ou en visio</span>
      </div>
    </div>
    <div class="wrap foot__row">
      <p>© <span data-year>2026</span> MetriKs Agency</p>
      <p>Création de site internet au Havre, à Montivilliers et partout en France</p>
    </div>
    <div class="foot__giant" aria-hidden="true">Metri<span class="k">K</span>s</div>
  </footer>`;
}

const LIGHTBOX = `<dialog class="lightbox" aria-label="Visuel en grand">
    <button class="lightbox__close" type="button" aria-label="Fermer">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
    </button>
    <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Visuel précédent">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
    </button>
    <figure>
      <img alt="" />
      <figcaption></figcaption>
    </figure>
    <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Visuel suivant">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
    </button>
  </dialog>`;

function band(words) {
  const one = words.map((w) => `<span>${w}</span><b></b>`).join("");
  return `<div class="band" aria-hidden="true">
      <div class="band__track">
        ${one}
        ${one}
      </div>
    </div>`;
}

function contactCta(B, text) {
  return `<section class="contact" aria-labelledby="contact-title">
      <div class="contact__lines" aria-hidden="true"></div>
      <div class="wrap contact__inner">
        <h2 class="contact__title split" id="contact-title">Votre prochain client vous cherche <em>déjà.</em></h2>
        <div class="contact__body">
          <p>${text || `Réservez votre diagnostic offert : ${hl("45 minutes pour faire le point")} sur votre site, votre image et ce qui vous freine. En rendez-vous près du Havre ou en visio, où que vous soyez. Sans engagement.`}</p>
          <div class="contact__actions">
            <a class="btn btn--ink" href="${B}contact/"><span>Réserver mon diagnostic</span>${ARROW}</a>
            <button class="copy" type="button" data-copy="${EMAIL}">
              <span data-copy-label>${EMAIL}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>`;
}

// En-tête de page intérieure
function phero({ B, kw, crumb, lines, lead, visual, ctas, kind }) {
  return `<section class="phero phero--${kind}" id="top" aria-labelledby="page-title">
      <div class="phero__dial" aria-hidden="true">${dial()}</div>
      <div class="wrap phero__grid">
        <div class="phero__text">
          <nav class="crumbs" aria-label="Fil d'Ariane"><ol><li><a href="${B}">Accueil</a></li><li aria-current="page">${crumb}</li></ol></nav>
          <h1 class="phero__title" id="page-title">
            <span class="phero__kw"><span>${kw}</span></span>
${lines.map((l) => `            <span class="line"><span>${l}</span></span>`).join("\n")}
          </h1>
          <p class="phero__lead">${lead}</p>
          <div class="phero__actions">${ctas}</div>
        </div>
        <div class="phero__visual">${visual}</div>
      </div>
    </section>`;
}

// Liste de points (même style que l'offre de l'accueil)
const offer = (items) => `<ol class="offer">
${items.map(([t, p]) => `            <li class="offer__item"><h3>${t}</h3><p>${p}</p></li>`).join("\n")}
          </ol>`;

// Bloc titre + texte
function feel({ id, title, body, aside }) {
  return `<section class="feel"${id ? ` id="${id}"` : ""} aria-labelledby="${id || "feel"}-title">
      <div class="wrap feel__grid">
        <h2 class="h-xl split" id="${id || "feel"}-title">${title}</h2>
        <div class="feel__body">${body.map((p) => `<p>${p}</p>`).join("")}${aside || ""}</div>
      </div>
    </section>`;
}

function section({ id, cls = "", title, intro, content }) {
  return `<section class="block ${cls}"${id ? ` id="${id}"` : ""} aria-labelledby="${id}-title">
      <div class="wrap">
        <div class="block__head">
          <h2 class="h-xl split" id="${id}-title">${title}</h2>
          ${intro ? `<p>${intro}</p>` : ""}
        </div>
        ${content}
      </div>
    </section>`;
}

function faq(items) {
  return `<div class="faq">
${items.map(([q, a]) => `          <details class="faq__item"><summary><h3>${q}</h3><span class="faq__icon" aria-hidden="true"></span></summary><div class="faq__a"><p>${a}</p></div></details>`).join("\n")}
        </div>`;
}

function svcRows(B, list) {
  return `<ul class="svc">
${list.map((s) => `          <li><a class="svc__row" href="${B}${s.slug}/"><span class="svc__name">${s.name}</span><span class="svc__line">${s.line}</span><span class="svc__go" aria-hidden="true">${ARROW}</span></a></li>`).join("\n")}
        </ul>`;
}

function related(B, current) {
  return section({
    id: "services-lies", cls: "block--tight",
    title: "Les autres <em>services.</em>",
    content: svcRows(B, SERVICES.filter((s) => s.slug !== current)),
  });
}

/* ------------------------------------------------------------------ */
/* Visuels des en-têtes                                                */
/* ------------------------------------------------------------------ */
const img = (B, src, alt, w = 1280, h = 800, extra = "") => `<img src="${B}${src}" alt="${esc(alt)}" width="${w}" height="${h}"${extra}>`;

const visStack = (B, a, b) => `<div class="stack">
          <figure class="stack__a">${img(B, "assets/img/web/" + a[0], a[1], 1280, 800, ' fetchpriority="high"')}</figure>
          <figure class="stack__b">${img(B, "assets/img/web/" + b[0], b[1], 1280, 800, ' loading="lazy"')}</figure>
        </div>`;

const visWipe = (B) => `<div class="wipe" aria-hidden="true">
          <img class="wipe__old" src="${B}assets/img/web/rmc-batiment-1.webp" alt="" width="1280" height="800">
          <div class="wipe__new"><img src="${B}assets/img/web/rmc-batiment-1.webp" alt="" width="1280" height="800"></div>
          <span class="wipe__bar"></span>
        </div>`;

const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
const visSearch = () => `<div class="search" data-search>
          <div class="search__bar"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg><span class="search__q" data-search-q>plombier Montivilliers</span><i class="search__caret"></i></div>
          <ol class="search__list">
            <li class="search__hit is-you"><span class="search__pin"></span><div><b data-search-name>Votre entreprise</b><span class="search__stars">${STAR.repeat(5)}<em>Ouvert</em></span><span class="search__meta" data-search-meta>Plombier · Montivilliers</span></div><span class="search__call">Appeler</span></li>
            <li class="search__hit"><span class="search__pin"></span><div><b class="search__ghost"></b><span class="search__ghost search__ghost--s"></span></div></li>
            <li class="search__hit"><span class="search__pin"></span><div><b class="search__ghost"></b><span class="search__ghost search__ghost--s"></span></div></li>
          </ol>
          <p class="search__note">Illustration</p>
        </div>`;

const visCards = (B) => `<div class="cards">
          <figure class="cards__a">${img(B, "assets/img/cartes/metriks-carte-recto.webp", "Carte de visite MetriKs, recto", 1005, 650, ' fetchpriority="high"')}</figure>
          <figure class="cards__b">${img(B, "assets/img/cartes/metriks-carte-verso.webp", "Carte de visite MetriKs, verso", 1005, 650)}</figure>
          <p class="cards__cap">Les cartes de visite MetriKs</p>
        </div>`;

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const visPortal = () => `<div class="portal" data-portal>
          <div class="portal__top"><span class="wordmark">Metri<span class="k">K</span>s</span><span>Espace client</span><em>Aperçu</em></div>
          <div class="portal__body">
            <div class="portal__progress">
              <div class="portal__row"><b>Votre site</b><span><span data-portal-pct>0</span> %</span></div>
              <div class="portal__bar"><i data-portal-bar></i></div>
              <ol class="portal__steps">
                <li class="is-done">Diagnostic</li><li class="is-done">Maquette</li><li class="is-now">Développement</li><li>Mise en ligne</li>
              </ol>
            </div>
            <div class="portal__asks">
              <p class="portal__label">Éléments demandés</p>
              <ul>
                <li class="is-done"><span class="portal__check">${CHECK}</span>Logo en haute définition</li>
                <li class="is-done"><span class="portal__check">${CHECK}</span>Textes de la page Services</li>
                <li data-portal-ask><span class="portal__check">${CHECK}</span>Photos de l'équipe<em>Déposer</em></li>
              </ul>
            </div>
            <div class="portal__chat">
              <p class="portal__label">Messages</p>
              <p class="portal__msg portal__msg--you">On peut ajouter nos horaires d'été ?</p>
              <p class="portal__msg portal__msg--mk">C'est en ligne sur la page Contact. Dites-moi si ça vous va.</p>
            </div>
          </div>
        </div>`;

const visPosters = (B) => {
  const pick = ["hac-vs-strasbourg", "stb-vs-svbd-30-09-25", "hac-handball-vs-hbpc"];
  return `<div class="fan">
${pick.map((f, i) => { const p = D.posters.find((x) => x.file === f); return `          <figure class="fan__${i}">${img(B, `assets/img/posters/${f}-640.webp`, `Affiche ${p.title} (${p.sport})`, 640, 800, i === 1 ? ' fetchpriority="high"' : "")}</figure>`; }).join("\n")}
        </div>`;
};

const visTicket = () => `<div class="ticket">
          <div class="ticket__main">
            <span class="wordmark">Metri<span class="k">K</span>s</span>
            <p class="ticket__title">Diagnostic offert</p>
            <dl>
              <div><dt>Durée</dt><dd>45 min</dd></div>
              <div><dt>Lieu</dt><dd>Sur place ou en visio</dd></div>
              <div><dt>Prix</dt><dd>Offert</dd></div>
              <div><dt>Engagement</dt><dd>Aucun</dd></div>
            </dl>
          </div>
          <div class="ticket__stub"><span>Admis</span></div>
        </div>`;

/* ------------------------------------------------------------------ */
/* Gabarit de page                                                     */
/* ------------------------------------------------------------------ */
function page({ slug, title, desc, current, main, schema = [], home = false, bandWords }) {
  const B = slug ? "../" : "";
  const url = SITE + (slug ? slug + "/" : "");
  const org = { "@type": "ProfessionalService", "@id": SITE + "#organization" };
  const graph = [...schema];
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/\n/g, "\n  ");
  return `<!doctype html>
<html lang="fr" data-style="harmonie"${slug ? ' data-base="../"' : ""} data-page="${slug || "accueil"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="theme-color" content="#0b0d12" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}assets/img/og-image.jpg" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:site_name" content="MetriKs Agency" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" href="${B}assets/img/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="${B}assets/img/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="${B}assets/img/apple-touch-icon.png" />
  <script type="application/ld+json">
  ${ld}
  </script>
  <link rel="preload" href="${B}assets/fonts/TacticSansExd-Lgt.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="${B}assets/fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="${B}assets/css/main.css" />
  <script>
    document.documentElement.classList.add("js");
    (function () {
      var q = new URLSearchParams(location.search), h = document.documentElement;
      if (q.get("palette")) h.setAttribute("data-palette", q.get("palette"));
      if (q.get("style")) h.setAttribute("data-style", q.get("style"));
    })();
    setTimeout(function () { var c = document.querySelector(".curtain"); if (c && !window.gsap) c.remove(); }, 4000);
  </script>
</head>
<body>
  <a class="skip" href="#contenu">Aller au contenu</a>

  <div class="curtain" aria-hidden="true">
    <div class="curtain__word"><span>Metri</span><span class="k">K</span><span>s</span></div>
    <div class="curtain__bar"><i></i></div>
  </div>

  ${header(B, current || slug)}

  <main id="contenu">
    ${main(B)}
  </main>

  ${footer(B)}

  ${LIGHTBOX}

  <div class="grain" aria-hidden="true"></div>

  <script src="${B}assets/js/gsap.min.js" defer></script>
  <script src="${B}assets/js/ScrollTrigger.min.js" defer></script>
  <script src="${B}assets/js/SplitText.min.js" defer></script>
  <script src="${B}assets/js/lenis.min.js" defer></script>
  <script src="${B}assets/js/data.js" defer></script>
${home ? `  <script src="${B}assets/js/scene.js" defer></script>\n` : ""}  <script src="${B}assets/js/main.js" defer></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* Schémas                                                             */
/* ------------------------------------------------------------------ */
const ORG = {
  "@type": "ProfessionalService",
  "@id": SITE + "#organization",
  name: "MetriKs Agency",
  description: "Agence web basée à Montivilliers, près du Havre : création et refonte de sites internet, référencement local et identité visuelle pour les entreprises, commerces, artisans et clubs sportifs, partout en France.",
  url: SITE,
  image: SITE + "assets/img/og-image.jpg",
  logo: SITE + "assets/img/apple-touch-icon.png",
  email: EMAIL,
  address: { "@type": "PostalAddress", addressLocality: "Montivilliers", postalCode: "76290", addressRegion: "Normandie", addressCountry: "FR" },
  geo: { "@type": "GeoCoordinates", latitude: 49.5453, longitude: 0.1883 },
  areaServed: [
    { "@type": "City", name: "Montivilliers" }, { "@type": "City", name: "Le Havre" }, { "@type": "City", name: "Harfleur" },
    { "@type": "City", name: "Gonfreville-l'Orcher" }, { "@type": "City", name: "Octeville-sur-Mer" },
    { "@type": "AdministrativeArea", name: "Seine-Maritime" }, { "@type": "AdministrativeArea", name: "Normandie" }, { "@type": "Country", name: "France" },
  ],
  knowsAbout: ["Création de site internet", "Refonte de site web", "Référencement local", "Identité visuelle"],
  sameAs: D.projects.map((p) => p.url).filter(Boolean),
};
const crumbsLd = (slug, name) => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE },
    { "@type": "ListItem", position: 2, name, item: SITE + slug + "/" },
  ],
});
const serviceLd = (slug, name, desc) => ({
  "@type": "Service", name, description: desc, url: SITE + slug + "/",
  provider: { "@id": SITE + "#organization" },
  areaServed: [{ "@type": "City", name: "Le Havre" }, { "@type": "City", name: "Montivilliers" }, { "@type": "Country", name: "France" }],
});
const faqLd = (items) => ({
  "@type": "FAQPage",
  mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: strip(q), acceptedAnswer: { "@type": "Answer", text: strip(a) } })),
});

/* ------------------------------------------------------------------ */
/* PAGES                                                               */
/* ------------------------------------------------------------------ */
const pages = [];

/* ---------------- Accueil ---------------- */
pages.push({
  slug: "",
  home: true,
  title: "MetriKs · Agence web à Montivilliers, près du Havre",
  desc: "Sites internet et identités visuelles pour les artisans, commerçants et indépendants qui aiment leur métier. Agence web à Montivilliers, près du Havre.",
  schema: [ORG, { "@type": "WebSite", "@id": SITE + "#website", url: SITE, name: "MetriKs Agency", inLanguage: "fr-FR", publisher: { "@id": SITE + "#organization" } }],
  main: (B) => `<!-- HERO -->
    <section class="hero" id="top" aria-labelledby="hero-title">
      <canvas class="hero__gl" aria-hidden="true"></canvas>
      <div class="hero__fallback" aria-hidden="true">
        <div class="services__screen" data-mock="1"></div>
        <div class="services__screen services__screen--b" data-mock="0"></div>
      </div>
      <div class="hero__shade" aria-hidden="true"></div>

      <div class="hero__inner">
        <h1 class="hero__title" id="hero-title">
          <span class="line"><span>Vous faites</span></span>
          <span class="line"><span>du beau travail.</span></span>
          <span class="line line--accent"><span><em>Montrez-le.</em></span></span>
        </h1>
        <div class="hero__foot">
          <div class="hero__lead">
            <p class="hero__for">Pour les <span class="rotator" data-rotator><span>restaurants</span></span></p>
            <p>Vous avez mis des années à bâtir votre savoir-faire. MetriKs lui construit ${hl("un site à sa hauteur")}, celui dont vous donnerez l'adresse avec fierté. Agence web à Montivilliers, près du Havre, pour toute la France.</p>
          </div>
          <div class="hero__actions">
            ${btn(B + "contact/", "Réserver mon diagnostic offert")}
            ${btn(B + "realisations/", "Voir les réalisations", "line")}
          </div>
        </div>
      </div>

      <p class="hero__aerial" aria-hidden="true">
        <span>Sites web et identité visuelle.</span>
        <span>Une seule adresse : Metri<em>K</em>s.</span>
      </p>

      <div class="hero__ticker" aria-hidden="true">
        <span>Glissez pour faire tourner la galerie</span>
        <span class="hero__scroll"><i></i></span>
      </div>
    </section>

    ${band(["Création de site internet", "Refonte", "Référencement local", "Identité visuelle", "Espace client"])}

    <!-- MANIFESTE -->
    <section class="manifesto" aria-label="Pourquoi votre site compte">
      <div class="wrap">
        <p class="manifesto__text" data-words>Ce soir, quelqu'un cherche votre métier sur son téléphone, depuis son canapé. Votre accueil, votre sourire, la qualité de votre travail : il n'en sait rien. Il ouvre votre site. <em>Trois secondes plus tard,</em> il sait s'il vous appelle.</p>
        <p class="manifesto__end">MetriKs travaille sur ces trois secondes. ${hl("Le reste, vous savez déjà le faire.")}</p>
      </div>
    </section>

    <!-- SERVICES -->
    <section class="services" id="services" aria-labelledby="services-title">
      <div class="wrap services__grid">
        <div class="services__aside">
          <h2 class="h-xl split" id="services-title">Être trouvé.<br /><em>Être choisi.</em></h2>
          <p class="services__intro">MetriKs s'occupe de tout ce qui se passe avant le premier coup de fil : ce qu'on trouve sur Google, et ${hl("ce qu'on ressent en découvrant votre site.")}</p>
          <div class="services__screens" aria-hidden="true">
            <div class="services__screen" data-mock="0"></div>
            <div class="services__screen services__screen--b" data-mock="1"></div>
          </div>
        </div>
        <div class="services__main">
          ${svcRows(B, SERVICES)}
        </div>
      </div>
    </section>

    <!-- REALISATIONS -->
    <section class="sites" id="realisations" aria-labelledby="sites-title">
      <div class="wrap">
        <div class="sites__head">
          <h2 class="h-xl split" id="sites-title">Des sites qui font<br />sonner le <em>téléphone.</em></h2>
          <p>Chaque site MetriKs part de votre métier et de vos clients, avec un seul objectif : que la personne qui le visite ${hl("décroche son téléphone ou pousse votre porte.")}</p>
        </div>
        <ol class="projects" data-projects></ol>
        <div class="more">${btn(B + "realisations/", "Toutes les réalisations", "line")}</div>
      </div>
      <div class="preview" aria-hidden="true"><div class="preview__inner"></div></div>
    </section>

    <!-- METHODE -->
    <section class="plan" id="methode" aria-labelledby="plan-title">
      <div class="wrap">
        <div class="sites__head">
          <h2 class="h-xl split" id="plan-title">Vous savez toujours<br />où en est <em>votre site.</em></h2>
          <p>Avec MetriKs, vous avez votre propre espace client. ${hl("Vous suivez l'avancée en direct")}, vous envoyez vos photos et vous posez vos questions au même endroit.</p>
        </div>
        <div class="timeline">
          <div class="timeline__track" aria-hidden="true"><i data-timeline></i></div>
          <ol class="timeline__steps">
            <li class="step"><span class="step__min">Étape 1</span><h3>Diagnostic offert</h3><p>45 minutes pour parler de vous, de vos clients et de ce qui vous freine.</p></li>
            <li class="step"><span class="step__min">Étape 2</span><h3>Maquette</h3><p>Vous voyez votre futur site ${hl("avant la moindre ligne de code.")}</p></li>
            <li class="step"><span class="step__min">Étape 3</span><h3>Développement</h3><p>Vous suivez chaque avancée depuis votre espace client.</p></li>
            <li class="step"><span class="step__min">Étape 4</span><h3>Mise en ligne et suivi</h3><p>Votre site part en ligne. MetriKs ${hl("reste joignable")} depuis votre espace.</p></li>
          </ol>
        </div>
        <div class="more">${btn(B + "methode/", "La méthode et l'espace client", "line")}</div>
      </div>
    </section>

    <!-- CLUBS SPORTIFS -->
    <section class="clubs" id="clubs" aria-labelledby="clubs-title">
      <div class="wrap clubs__head">
        <h2 class="h-xl split" id="clubs-title">Les clubs aussi<br />ont leur <em>vitrine.</em></h2>
        <p>Le jour de match, vos supporters découvrent votre affiche avant d'entrer dans le stade. MetriKs la dessine pour qu'ils aient ${hl("hâte d'y être.")} Affiches, rebranding complet et site du club.</p>
      </div>
      <div class="reel" data-reel aria-label="Affiches sport réalisées par MetriKs">
        <div class="reel__track" data-reel-track></div>
      </div>
      <div class="wrap more">${btn(B + "clubs-sportifs/", "Voir le travail pour les clubs", "line")}</div>
    </section>

    <!-- CONTACT -->
    ${contactCta(B)}`,
});

/* ---------------- Création de site ---------------- */
const creaFaq = [
  ["Combien coûte la création d'un site internet ?", "Le prix dépend du nombre de pages et des fonctionnalités dont vous avez besoin. Après le diagnostic offert, MetriKs vous envoie un devis clair, sans engagement."],
  ["Combien de temps faut-il pour créer mon site ?", "Le délai dépend de la taille du site et du temps qu'il faut pour réunir vos textes et vos photos. MetriKs vous donne un calendrier dès le départ, et vous suivez chaque étape dans votre espace client."],
  ["Je ne suis pas en Normandie. MetriKs peut-il créer mon site ?", "Oui. MetriKs est basé à Montivilliers, près du Havre, et travaille avec des entreprises partout en France. Les rendez-vous se font en visio et le suivi passe par votre espace client."],
  ["Mon site sera-t-il visible sur Google ?", "MetriKs construit chaque site sur les bases du référencement : une structure propre, des titres et des descriptions soignés, des pages rapides. Pour ressortir dans votre ville, le <a href=\"../referencement-local/\">référencement local</a> va plus loin."],
];
pages.push({
  slug: "creation-site-internet",
  title: "Création de site internet Le Havre, Montivilliers · MetriKs",
  desc: "Création de site internet sur-mesure au Havre, à Montivilliers et partout en France. Un site rapide, pensé pour le téléphone, qui donne envie de vous appeler.",
  schema: [crumbsLd("creation-site-internet", "Création de site internet"), serviceLd("creation-site-internet", "Création de site internet", "Création de sites internet vitrines sur-mesure, rapides et pensés pour le mobile."), faqLd(creaFaq)],
  main: (B) => `${phero({
    B, kind: "stack", kw: "Création de site internet", crumb: "Création de site internet",
    lines: ["Un site qui", "vous <em>ressemble.</em>"],
    lead: `Votre site parle à votre place quand vous êtes sur un chantier, en cuisine ou avec une cliente. MetriKs le dessine pour qu'il donne la même impression que vous en vrai : ${hl("celle d'un pro à qui on a envie de confier son projet.")}`,
    ctas: btn(B + "contact/", "Réserver mon diagnostic") + btn(B + "realisations/", "Voir les réalisations", "line"),
    visual: visStack(B, ["institut-beaute-montivilliers-1.webp", "Site de l'Institut de Beauté de Montivilliers"], ["rmc-batiment-1.webp", "Site de RMC Bâtiment"]),
  })}

    ${band(["Sur-mesure", "Pensé pour le téléphone", "Rapide", "Visible sur Google", "Espace client"])}

    ${feel({
      id: "impression",
      title: "Trois secondes pour <em>convaincre.</em>",
      body: [
        `Votre futur client regarde votre site avant de le lire. Les photos, les couleurs et la place de votre numéro lui disent en un instant ${hl("s'il peut vous faire confiance.")}`,
        "MetriKs part de ce que vous faites de mieux et le met en scène. Vos chantiers, vos plats, vos soins : ce sont eux qui convainquent. Le site leur donne toute la place.",
      ],
    })}

    ${section({
      id: "benefices", title: "Ce que votre site<br /><em>change pour vous.</em>",
      intro: "Un site MetriKs se voit, et il se ressent aussi dans votre quotidien.",
      content: offer([
        ["Vous donnez l'adresse avec fierté", `Un design dessiné pour votre métier, à partir de zéro. ${hl("Il ne ressemble à aucun autre site")} de votre ville.`],
        ["On vous appelle en un geste", `MetriKs pense votre site d'abord pour le téléphone : votre numéro, vos horaires et votre adresse restent ${hl("à portée de pouce.")}`],
        ["Vos visiteurs restent", `MetriKs code chaque site à la main, sans surcharge. Les pages s'affichent ${hl("en un clin d'œil")} et vos visiteurs n'ont pas le temps de partir.`],
        ["Google vous connaît dès le premier jour", `Titres, textes, structure : MetriKs prépare votre référencement ${hl("dès la conception du site.")}`],
      ]),
    })}

    ${section({
      id: "metiers", title: "Votre métier,<br /><em>votre site.</em>",
      intro: "Un restaurateur et un maçon n'attendent pas la même chose de leur site. MetriKs part des questions que se posent vos clients.",
      content: `<ul class="sectors__list">
            <li><strong>Restaurants et bars</strong><small>Carte, réservation, avis clients</small></li>
            <li><strong>Artisans et BTP</strong><small>Chantiers réalisés, devis, zone d'intervention</small></li>
            <li><strong>Beauté et <span class="nw">bien-être</span></strong><small>Prestations, tarifs, prise de rendez-vous</small></li>
            <li><strong>Commerces</strong><small>Horaires, produits, itinéraire</small></li>
            <li><strong>Professions libérales</strong><small>Expertise, confiance, prise de contact</small></li>
            <li class="sectors__club"><a href="${B}clubs-sportifs/"><strong>Clubs sportifs</strong><small>Affiches, identité, site du club</small><span class="sectors__go" aria-hidden="true">${ARROW}</span></a></li>
          </ul>`,
    })}

    <section class="sites sites--inner" aria-labelledby="sites-title">
      <div class="wrap">
        <div class="sites__head">
          <h2 class="h-xl split" id="sites-title">Ils ont franchi <em>le pas.</em></h2>
          <p>Deux entreprises normandes, deux métiers, ${hl("deux sites qui leur ressemblent.")}</p>
        </div>
        <ol class="projects" data-projects></ol>
      </div>
      <div class="preview" aria-hidden="true"><div class="preview__inner"></div></div>
    </section>

    ${section({ id: "questions", title: "Vos <em>questions.</em>", content: faq(creaFaq) })}

    ${related(B, "creation-site-internet")}

    ${contactCta(B)}`,
});

/* ---------------- Refonte ---------------- */
const refFaq = [
  ["Vais-je perdre mon référencement avec une refonte ?", "MetriKs relève toutes les pages de votre site actuel et redirige chaque ancienne adresse vers la nouvelle page qui lui correspond. Votre place sur Google suit votre nouveau site."],
  ["Est-ce que je garde mon nom de domaine ?", "Oui. Votre adresse reste la même : vos clients, vos cartes de visite et vos liens continuent de fonctionner."],
  ["Mon site actuel a été fait avec WordPress ou Wix. Est-ce un problème ?", "Non. MetriKs part de ce que vous avez, quel que soit l'outil utilisé, et reconstruit un site sur-mesure."],
  ["Combien coûte une refonte ?", "Le prix dépend de l'état de votre site et de ce que vous voulez changer. Le diagnostic offert permet de chiffrer la refonte, sans engagement."],
];
pages.push({
  slug: "refonte-site-internet",
  title: "Refonte de site internet Le Havre, Montivilliers · MetriKs",
  desc: "Votre site a vieilli ? MetriKs refait votre site internet sans perdre votre place sur Google. Au Havre, à Montivilliers et partout en France.",
  schema: [crumbsLd("refonte-site-internet", "Refonte de site internet"), serviceLd("refonte-site-internet", "Refonte de site internet", "Refonte complète de sites internet avec conservation du référencement."), faqLd(refFaq)],
  main: (B) => `${phero({
    B, kind: "wipe", kw: "Refonte de site internet", crumb: "Refonte de site internet",
    lines: ["Retrouvez la fierté", "de <em>votre site.</em>"],
    lead: `Vous hésitez à donner l'adresse de votre site ? MetriKs lui redonne une allure à la hauteur de votre travail, ${hl("sans perdre la place déjà gagnée sur Google.")}`,
    ctas: btn(B + "contact/", "Faire le diagnostic de mon site") + btn(B + "realisations/", "Voir les réalisations", "line"),
    visual: visWipe(B),
  })}

    ${band(["Nouvelle allure", "Référencement conservé", "Pensé pour le téléphone", "Même adresse", "Espace client"])}

    <section class="signs" aria-labelledby="signs-title">
      <div class="wrap">
        <h2 class="h-xl split" id="signs-title">Il est temps de changer<br /><em>si vous vous reconnaissez.</em></h2>
        <ul class="signs__list">
          <li><span class="signs__mark" aria-hidden="true"></span>Vous vous excusez en donnant l'adresse de votre site.</li>
          <li><span class="signs__mark" aria-hidden="true"></span>Sur téléphone, vos clients doivent zoomer pour vous lire.</li>
          <li><span class="signs__mark" aria-hidden="true"></span>Vos concurrents ont l'air plus sérieux que vous, alors que vous travaillez mieux.</li>
          <li><span class="signs__mark" aria-hidden="true"></span>Plus personne ne vous dit “je vous ai trouvé sur internet”.</li>
        </ul>
      </div>
    </section>

    ${section({
      id: "methode-refonte", title: "Une refonte<br /><em>sans rien perdre.</em>",
      intro: "Changer de site fait peur quand on a mis du temps à se faire une place. MetriKs garde ce qui marche et change le reste.",
      content: offer([
        ["Un état des lieux honnête", `MetriKs repère ce qui fonctionne sur votre site actuel : les pages que Google aime, les demandes qui arrivent. ${hl("Tout ça reste.")}`],
        ["Une nouvelle allure", `Un design actuel, pensé pour votre métier et pour le téléphone. Vos clients retrouvent ${hl("le pro qu'ils connaissent")} en vrai.`],
        ["Votre place sur Google protégée", `Chaque ancienne adresse renvoie vers la bonne page. Vos visiteurs et Google ${hl("ne tombent sur aucune page d'erreur.")}`],
        ["Un suivi en direct", `Vous voyez la nouvelle version avancer dans votre ${hl("espace client")} et vous validez chaque étape.`],
      ]),
    })}

    ${section({ id: "questions", title: "Vos <em>questions.</em>", content: faq(refFaq) })}

    ${related(B, "refonte-site-internet")}

    ${contactCta(B)}`,
});

/* ---------------- Référencement local ---------------- */
const seoFaq = [
  ["Qu'est-ce que le référencement local ?", "C'est le travail qui vous fait apparaître quand quelqu'un cherche votre métier dans une ville précise, sur Google et sur Google Maps."],
  ["En combien de temps voit-on des résultats ?", "Les premiers effets arrivent en quelques semaines ou quelques mois. Tout dépend de la concurrence dans votre métier et dans votre ville."],
  ["Ça marche en dehors du Havre ?", "Oui. MetriKs travaille le référencement de ses clients là où ils exercent : à Montivilliers, au Havre, à Rouen, à Marseille ou ailleurs."],
  ["Faut-il refaire mon site pour être mieux référencé ?", "Pas forcément. Le diagnostic offert permet de voir si votre site actuel peut progresser ou s'il vous freine."],
];
pages.push({
  slug: "referencement-local",
  title: "Référencement local Le Havre, Montivilliers · MetriKs",
  desc: "Soyez trouvé quand on cherche votre métier dans votre ville. MetriKs travaille votre site et votre fiche Google, au Havre, à Montivilliers et ailleurs.",
  schema: [crumbsLd("referencement-local", "Référencement local"), serviceLd("referencement-local", "Référencement local", "Référencement local sur Google et Google Maps : fiche d'établissement, pages locales, avis clients."), faqLd(seoFaq)],
  main: (B) => `${phero({
    B, kind: "search", kw: "Référencement local", crumb: "Référencement local",
    lines: ["Quand on vous cherche,", "<em>on vous trouve.</em>"],
    lead: `19 h, une fuite sous l'évier. Votre futur client sort son téléphone et tape votre métier suivi de sa ville. MetriKs ${hl("place votre nom sous ses yeux.")}`,
    ctas: btn(B + "contact/", "Réserver mon diagnostic") + btn(B + "#services", "Tous les services", "line"),
    visual: visSearch(),
  })}

    ${band(["Google", "Google Maps", "Fiche d'établissement", "Avis clients", "Votre ville"])}

    ${feel({
      id: "premiers",
      title: "Les premiers résultats<br /><em>reçoivent les appels.</em>",
      body: [
        `Votre client fait défiler quelques noms, puis il appelle. ${hl("Il s'arrête aux premiers résultats.")}`,
        "Si vous n'y êtes pas, il appelle quelqu'un d'autre, même si vous travaillez mieux. MetriKs vous aide à prendre la place que votre travail mérite.",
      ],
    })}

    ${section({
      id: "leviers", title: "Ce que MetriKs<br /><em>travaille pour vous.</em>",
      content: offer([
        ["Votre fiche Google soignée", `Photos, horaires, services, catégories : MetriKs complète votre fiche d'établissement pour qu'elle ${hl("donne envie de cliquer.")}`],
        ["Des pages pour vos villes", `Votre site parle des villes où vous travaillez, avec des contenus utiles. ${hl("Google comprend où vous proposer.")}`],
        ["Des avis qui rassurent", `MetriKs vous aide à récolter les avis de vos clients contents et à y répondre avec soin. ${hl("Vos futurs clients les lisent avant d'appeler.")}`],
        ["Un site rapide et propre", `Google préfère les sites rapides et bien construits. MetriKs soigne cette ${hl("technique invisible")} pour vous.`],
      ]),
    })}

    ${section({ id: "questions", title: "Vos <em>questions.</em>", content: faq(seoFaq) })}

    ${related(B, "referencement-local")}

    ${contactCta(B)}`,
});

/* ---------------- Identité visuelle ---------------- */
const idFaq = [
  ["Que contient une identité visuelle ?", "Un logo et ses variantes, une palette de couleurs, des typographies et les règles pour les utiliser. MetriKs y ajoute les supports dont vous avez besoin, comme vos cartes de visite."],
  ["Pouvez-vous moderniser mon logo actuel ?", "Oui. MetriKs peut faire évoluer votre logo sans perdre ce qui permet à vos clients de le reconnaître."],
  ["Mon site et mon identité peuvent-ils être faits ensemble ?", "Oui, et c'est le plus simple : votre site reprend votre identité dès sa conception, et tout parle d'une seule voix."],
];
pages.push({
  slug: "identite-visuelle",
  title: "Identité visuelle et logo Le Havre, Montivilliers · MetriKs",
  desc: "Logo, couleurs, typographies, cartes de visite : MetriKs crée des identités visuelles qu'on reconnaît au premier coup d'œil, pour entreprises et clubs.",
  schema: [crumbsLd("identite-visuelle", "Identité visuelle"), serviceLd("identite-visuelle", "Identité visuelle", "Création de logo, charte graphique et supports imprimés."), faqLd(idFaq)],
  main: (B) => `${phero({
    B, kind: "cards", kw: "Identité visuelle", crumb: "Identité visuelle",
    lines: ["Une image", "qu'on <em>reconnaît.</em>"],
    lead: `Votre logo sur la camionnette, votre carte posée sur un comptoir, votre page Instagram. Chaque fois qu'on croise votre nom, ${hl("on doit penser à vous et à personne d'autre.")}`,
    ctas: btn(B + "contact/", "Parler de mon identité") + btn(B + "clubs-sportifs/", "Voir les rebrandings", "line"),
    visual: visCards(B),
  })}

    ${band(["Logo", "Couleurs", "Typographies", "Cartes de visite", "Supports imprimés"])}

    ${feel({
      id: "confiance",
      title: "La confiance commence<br /><em>avant la rencontre.</em>",
      body: [
        `Un client qui voit une image soignée imagine un travail soigné. ${hl("Il vous choisit avant même de vous parler.")}`,
        "MetriKs construit votre identité à partir de votre histoire, de vos clients et de votre façon de travailler. Vous vous y reconnaissez dès le premier regard.",
      ],
    })}

    ${section({
      id: "contenu-identite", title: "Tout ce qui porte<br /><em>votre nom.</em>",
      content: offer([
        ["Un logo qui vous raconte", `Pensé pour rester lisible partout, ${hl("de l'enseigne à la photo de profil.")}`],
        ["Vos couleurs, vos typographies", "Une palette et des polices choisies pour votre métier, déclinées sur tous vos supports."],
        ["Des supports prêts à imprimer", `Cartes de visite, flyers, vitrine, véhicule : MetriKs livre ${hl("des fichiers prêts pour l'imprimeur.")}`],
        ["Un site dans la même lignée", `Votre identité et votre site ${hl("parlent d'une seule voix.")}`],
      ]),
    })}

    <section class="block" aria-labelledby="rebrand-title">
      <div class="wrap">
        <div class="block__head">
          <h2 class="h-xl split" id="rebrand-title">Des identités <em>complètes.</em></h2>
          <p>Pour les clubs sportifs, MetriKs a conçu des rebrandings entiers : couleurs, typographies et gabarits pour chaque publication.</p>
        </div>
        <ul class="trio">
${D.clubs.map((c) => `          <li><a href="${B}clubs-sportifs/"><figure class="poster">${img(B, `assets/img/clubs/${c.id}-${c.files[0]}-640.webp`, `Rebranding ${c.name}`, 640, 800, ' loading="lazy"')}</figure><span><b>${c.name}</b><small>${c.sport} · Rebranding</small></span></a></li>`).join("\n")}
        </ul>
      </div>
    </section>

    ${section({ id: "questions", title: "Vos <em>questions.</em>", content: faq(idFaq) })}

    ${related(B, "identite-visuelle")}

    ${contactCta(B)}`,
});

/* ---------------- Réalisations ---------------- */
const CASES = {
  "institut-beaute-montivilliers": {
    text: `Un univers doux et lumineux, fidèle à l'ambiance de l'institut. Les prestations et ${hl("la prise de rendez-vous se trouvent en un geste")}, et les formations ont leur propre espace.`,
    tags: ["Création de site", "Prise de rendez-vous", "Pensé pour le téléphone"],
  },
  "rmc-batiment": {
    text: `Des chantiers montrés en grand, des prestations claires et ${hl("un contact visible sur chaque page")} pour qu'une visite devienne une demande de devis.`,
    tags: ["Création de site", "Galerie de chantiers", "Demande de devis"],
  },
};
pages.push({
  slug: "realisations",
  title: "Réalisations : sites internet créés par MetriKs",
  desc: "Les sites internet créés par MetriKs pour des entreprises normandes, de l'institut de beauté à la maçonnerie, et les visuels réalisés pour des clubs sportifs.",
  schema: [crumbsLd("realisations", "Réalisations")],
  main: (B) => `${phero({
    B, kind: "stack", kw: "Réalisations", crumb: "Réalisations",
    lines: ["Des sites qui font", "sonner le <em>téléphone.</em>"],
    lead: `Chaque site MetriKs part d'un métier, d'un lieu et de vrais clients. ${hl("Voici des projets en ligne")}, que vous pouvez visiter vous-même.`,
    ctas: btn(B + "contact/", "Démarrer mon projet") + btn("#projets", "Voir les projets", "line"),
    visual: visStack(B, ["institut-beaute-montivilliers-2.webp", "Page formations de l'Institut de Beauté de Montivilliers"], ["rmc-batiment-2.webp", "Page prestations de RMC Bâtiment"]),
  })}

    ${band(D.projects.map((p) => p.name).concat(["Clubs sportifs", "Identités visuelles"]))}

    <section class="cases" id="projets" aria-label="Projets">
${D.projects.map((p, i) => {
  const c = CASES[p.slug] || { text: "", tags: [] };
  const host = p.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  return `      <article class="case${i % 2 ? " case--flip" : ""}" aria-labelledby="case-${p.slug}">
        <div class="wrap case__grid">
          <div class="case__text">
            <p class="case__meta"><span>${p.sector}</span><span>${p.place}</span></p>
            <h2 class="case__name" id="case-${p.slug}">${p.name}</h2>
            <p>${c.text}</p>
            <ul class="case__tags">${c.tags.map((t) => `<li>${t}</li>`).join("")}</ul>
            <a class="btn btn--line" href="${p.url}" target="_blank" rel="noopener"><span>Visiter ${host}</span>${ARROW}</a>
          </div>
          <div class="case__shots">
${p.captures.map((f, k) => `            <figure class="case__shot case__shot--${k}">${img(B, "assets/img/web/" + f, `${p.name} : capture ${k + 1} du site`, 1280, 800, ' loading="lazy"')}</figure>`).join("\n")}
          </div>
        </div>
      </article>`;
}).join("\n")}
    </section>

    <section class="clubs" aria-labelledby="clubs-title">
      <div class="wrap clubs__head">
        <h2 class="h-xl split" id="clubs-title">Et côté <em>terrain.</em></h2>
        <p>Affiches jour de match, compositions, scores et rebrandings complets : ${hl("des visuels qui donnent envie d'aller au stade.")}</p>
      </div>
      <div class="reel" data-reel aria-label="Affiches sport réalisées par MetriKs">
        <div class="reel__track" data-reel-track></div>
      </div>
      <div class="wrap more">${btn(B + "clubs-sportifs/", "Voir le travail pour les clubs", "line")}</div>
    </section>

    ${contactCta(B, `Votre site pourrait être le prochain de cette page. ${hl("Le diagnostic offert")} dure 45 minutes, en rendez-vous près du Havre ou en visio, où que vous soyez. Sans engagement.`)}`,
});

/* ---------------- Méthode ---------------- */
pages.push({
  slug: "methode",
  title: "Méthode et espace client : suivez votre site · MetriKs",
  desc: "Diagnostic, maquette, développement, mise en ligne : suivez votre site en direct dans votre espace client MetriKs, envoyez vos éléments, posez vos questions.",
  schema: [crumbsLd("methode", "Méthode et espace client")],
  main: (B) => `${phero({
    B, kind: "portal", kw: "Méthode et espace client", crumb: "Méthode",
    lines: ["Vous savez toujours", "où en est <em>votre site.</em>"],
    lead: `Fini les e-mails pour savoir où en est votre site. Avec MetriKs, vous avez votre propre espace client : ${hl("vous suivez l'avancée en direct")}, vous envoyez vos photos et vous posez vos questions au même endroit.`,
    ctas: btn(B + "contact/", "Réserver mon diagnostic") + btn("#etapes", "Voir les étapes", "line"),
    visual: visPortal(),
  })}

    ${band(["Diagnostic offert", "Maquette", "Développement", "Mise en ligne", "Suivi"])}

    <section class="plan plan--page" id="etapes" aria-labelledby="plan-title">
      <div class="wrap">
        <div class="sites__head">
          <h2 class="h-xl split" id="plan-title">Quatre étapes,<br /><em>aucune surprise.</em></h2>
          <p>Vous savez à chaque instant ce qui est fait, ce qui arrive et ${hl("ce que MetriKs attend de vous.")}</p>
        </div>
        <div class="timeline">
          <div class="timeline__track" aria-hidden="true"><i data-timeline></i></div>
          <ol class="timeline__steps">
            <li class="step"><span class="step__min">Étape 1</span><h3>Diagnostic offert</h3><p>45 minutes, en rendez-vous ou en visio, pour parler de vous, de vos clients et de ce qui vous fait perdre des demandes. ${hl("Sans engagement.")}</p></li>
            <li class="step"><span class="step__min">Étape 2</span><h3>Maquette</h3><p>MetriKs dessine votre futur site. Vous le voyez, vous le commentez et vous le validez ${hl("avant la moindre ligne de code.")}</p></li>
            <li class="step"><span class="step__min">Étape 3</span><h3>Développement</h3><p>MetriKs construit le site page par page. Vous suivez chaque avancée ${hl("depuis votre espace client")} et vous validez au fur et à mesure.</p></li>
            <li class="step"><span class="step__min">Étape 4</span><h3>Mise en ligne et suivi</h3><p>Votre site part en ligne. Une question, une modification ? Vous écrivez depuis votre espace et ${hl("MetriKs vous répond.")}</p></li>
          </ol>
        </div>
      </div>
    </section>

    <section class="space" aria-labelledby="space-title">
      <div class="wrap space__grid">
        <div class="space__head">
          <h2 class="h-xl split" id="space-title">Votre espace client,<br /><em>ouvert dès le premier jour.</em></h2>
          <p>Vous gardez la main sur votre projet sans y passer vos soirées. ${hl("Tout se trouve au même endroit")}, de la première maquette au service après-vente.</p>
        </div>
        <ul class="space__list">
          <li><span class="space__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 18h16M6 14l4-4 3 3 5-6"/></svg></span><h3>L'avancée en direct</h3><p>Chaque étape de votre site, avec ce qui est fait et ce qui arrive ensuite.</p></li>
          <li><span class="space__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4"/></svg></span><h3>Vos éléments au même endroit</h3><p>MetriKs a besoin d'un logo, de photos ou de textes ? ${hl("Vous les déposez en un clic.")}</p></li>
          <li><span class="space__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg></span><h3>Vos questions quand vous y pensez</h3><p>Vous écrivez au moment qui vous arrange. La réponse arrive dans votre espace, avec tout l'historique.</p></li>
          <li><span class="space__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6z"/></svg></span><h3>Après la mise en ligne aussi</h3><p>Une modification, un souci : votre espace reste ouvert et ${hl("sert de service après-vente.")}</p></li>
        </ul>
      </div>
    </section>

    ${contactCta(B)}`,
});

/* ---------------- Clubs sportifs ---------------- */
pages.push({
  slug: "clubs-sportifs",
  title: "Clubs sportifs : affiches, rebranding et site · MetriKs",
  desc: "Affiches jour de match, compositions, scores, rebranding et site internet : MetriKs donne à votre club une image à la hauteur de ses ambitions.",
  schema: [crumbsLd("clubs-sportifs", "Clubs sportifs"), serviceLd("clubs-sportifs", "Communication visuelle pour clubs sportifs", "Affiches jour de match, rebranding et sites internet pour clubs sportifs.")],
  main: (B) => `${phero({
    B, kind: "fan", kw: "Clubs sportifs", crumb: "Clubs sportifs",
    lines: ["Les clubs aussi", "ont leur <em>vitrine.</em>"],
    lead: `Le jour de match, vos supporters découvrent votre affiche avant d'entrer dans le stade. MetriKs la dessine pour qu'ils aient hâte d'y être, et donne à votre club ${hl("une image à la hauteur de ses ambitions.")}`,
    ctas: btn(B + "contact/", "Parler de mon club") + btn("#rebranding", "Voir les rebrandings", "line"),
    visual: visPosters(B),
  })}

    ${band(["Jour de match", "Compositions", "Scores", "Rebranding", "Site du club"])}

    <section class="clubs clubs--page" aria-labelledby="reel-title">
      <div class="wrap clubs__head">
        <h2 class="h-xl split" id="reel-title">Le jour de match,<br /><em>en grand.</em></h2>
        <p>Annonce, composition, score, résultat : chaque publication ${hl("donne envie de venir encourager l'équipe.")} Cliquez sur un visuel pour l'agrandir.</p>
      </div>
      <div class="reel" data-reel aria-label="Affiches sport réalisées par MetriKs">
        <div class="reel__track" data-reel-track></div>
      </div>

      <div class="wrap ids" id="rebranding">
        <div class="block__head block__head--ids">
          <h2 class="h-xl split" id="ids-title">Rebranding :<br /><em>une identité complète.</em></h2>
          <p>Des couleurs, des typographies et des gabarits pour chaque temps fort. ${hl("Vos supporters reconnaissent le club")} avant même de lire son nom.</p>
        </div>
        <div class="ids__tabs" role="tablist" aria-label="Choisir un rebranding"></div>
        <div class="ids__stage">
          <aside class="ids__card" aria-live="polite">
            <img class="ids__logo" src="${B}assets/img/logos/hac.png" alt="" width="120" height="120" />
            <h3 class="ids__name" data-club-name>Le Havre AC</h3>
            <p class="ids__sport" data-club-sport>Football · Rebranding</p>
            <p class="ids__desc" data-club-desc></p>
            <dl class="ids__stats">
              <div><dt>Formats</dt><dd data-club-count>13</dd></div>
              <div><dt>Déclinaisons</dt><dd data-club-kinds>Post</dd></div>
            </dl>
            <button class="ids__all" type="button" data-club-all>Voir tous les formats</button>
          </aside>
          <div class="ids__grid" data-club-grid></div>
        </div>
      </div>
    </section>

    ${section({
      id: "offre-clubs", title: "Ce que MetriKs<br /><em>fait pour les clubs.</em>",
      content: offer([
        ["Affiches jour de match", `Annonce, composition, score, résultat : ${hl("un visuel prêt pour chaque temps fort")}, à vos couleurs.`],
        ["Rebranding complet", `Couleurs, typographies, gabarits : une identité que vos supporters ${hl("reconnaissent au premier coup d'œil.")}`],
        ["Le site du club", `Calendrier, résultats, partenaires et inscriptions réunis dans un site que ${hl("vos licenciés ouvrent avec plaisir.")}`],
      ]),
    })}

    ${contactCta(B, `Parlons de votre club : ${hl("45 minutes offertes")} pour faire le point sur votre image, vos réseaux et votre site. En rendez-vous près du Havre ou en visio. Sans engagement.`)}`,
});

/* ---------------- Contact ---------------- */
pages.push({
  slug: "contact",
  title: "Contact et diagnostic offert · MetriKs, agence web",
  desc: "Réservez votre diagnostic offert de 45 minutes avec MetriKs, agence web à Montivilliers près du Havre. Sur place ou en visio, partout en France.",
  schema: [crumbsLd("contact", "Contact"), { "@type": "ContactPage", url: SITE + "contact/", about: { "@id": SITE + "#organization" } }],
  main: (B) => `${phero({
    B, kind: "ticket", kw: "Contact et diagnostic offert", crumb: "Contact",
    lines: ["Parlons de", "<em>votre projet.</em>"],
    lead: `En rendez-vous près du Havre ou en visio depuis chez vous : 45 minutes pour parler de votre métier, de vos clients et de ce qui vous freine aujourd'hui. ${hl("Vous repartez avec des idées claires")}, sans engagement.`,
    ctas: `<a class="btn btn--signal" href="${MAILTO}"><span>Réserver par e-mail</span>${ARROW}</a>
            <button class="copy copy--dark" type="button" data-copy="${EMAIL}"><span data-copy-label>${EMAIL}</span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/></svg></button>`,
    visual: visTicket(),
  })}

    ${section({
      id: "deroulement", title: "Pendant ces<br /><em>45 minutes.</em>",
      intro: "Vous parlez de votre métier. MetriKs écoute, pose des questions et regarde votre présence en ligne avec vous.",
      content: offer([
        ["Un regard neuf sur votre site", `Ce qui donne confiance, ce qui fait fuir, et ${hl("ce que vos clients voient vraiment")} sur leur téléphone.`],
        ["Vos priorités, dans l'ordre", "Site, référencement, image : vous savez par quoi commencer pour recevoir plus de demandes."],
        ["Une proposition claire", `Si vous souhaitez aller plus loin, MetriKs vous envoie ${hl("un devis simple et détaillé.")} Sinon, vous gardez les conseils.`],
      ]),
    })}

    <section class="reach" aria-labelledby="reach-title">
      <div class="wrap reach__grid">
        <h2 class="h-xl split" id="reach-title">Montivilliers,<br /><em>et partout ailleurs.</em></h2>
        <div class="reach__body">
          <p>MetriKs est basé à Montivilliers (76290), à côté du Havre. Les rendez-vous ont lieu sur place pour les entreprises de la région, ${hl("et en visio partout en France.")}</p>
          <p>Pour réserver, écrivez à <a class="reach__mail" href="${MAILTO}">${EMAIL}</a> avec quelques mots sur votre activité. MetriKs vous répond pour fixer un créneau.</p>
        </div>
      </div>
    </section>`,
});

/* ------------------------------------------------------------------ */
/* Écriture                                                            */
/* ------------------------------------------------------------------ */
for (const p of pages) {
  const html = page(p);
  const out = p.slug ? path.join(ROOT, p.slug, "index.html") : path.join(ROOT, "index.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log("écrit", path.relative(ROOT, out));
}

// Sitemap
const sm = pages.map((p) => `  <url>
    <loc>${SITE}${p.slug ? p.slug + "/" : ""}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${p.slug ? (SERVICES.some((s) => s.slug === p.slug) ? "0.9" : "0.7") : "1.0"}</priority>
  </url>`).join("\n");
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sm}
</urlset>
`);
console.log("écrit sitemap.xml");
