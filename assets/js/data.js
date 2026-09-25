/* Contenu du site : modifiez ici les visuels, clubs et projets web. */
window.METRIKS = {
  /* Affiches sport (bandeau défilant + anneaux 3D du hero) */
  posters: [
    { file: "bayeux-vs-om", title: "Historique", sport: "Football", ratio: 1.25 },
    { file: "hac-vs-strasbourg", title: "HAC vs Strasbourg", sport: "Football", ratio: 1.25 },
    { file: "idrissa-seydi-joueur-du-mois", title: "Joueur du mois", sport: "Football", ratio: 1.25 },
    { file: "stb-vs-svbd-30-09-25", title: "STB vs SVBD", sport: "Basket", ratio: 1.25 },
    { file: "greg-vs-om", title: "Greg Delain vs OM", sport: "Football", ratio: 1.778 },
    { file: "equipe-de-france-cdm", title: "En route vers l'Amérique", sport: "Football", ratio: 1.25 },
    { file: "hac-handball-vs-hbpc", title: "HAC Handball vs HBPC", sport: "Handball", ratio: 1.25 },
    { file: "okc", title: "OKC Thunder", sport: "Basket", ratio: 1.25 },
    { file: "bayeux-fc-vs-olymp-marseille", title: "Bayeux FC vs OM", sport: "Football", ratio: 1.25 },
    { file: "novak-djokovic", title: "Novak Djokovic", sport: "Tennis", ratio: 1.25 },
    { file: "malik-abdelmoula", title: "Malik Abdelmoula", sport: "Football", ratio: 1.778 },
    { file: "2tdc-om-psg", title: "Trophée des Champions", sport: "Football", ratio: 1.25 },
    { file: "dimitri-payet", title: "Dimitri Payet", sport: "Football", ratio: 1.25 },
    { file: "greg-delain-bayeux-vs-smcaen", title: "Bayeux vs SM Caen", sport: "Football", ratio: 1.778 },
    { file: "islande-france", title: "Islande vs France", sport: "Football", ratio: 1.25 },
    { file: "florian-thauvin", title: "Florian Thauvin", sport: "Football", ratio: 1.25 },
    { file: "diegzy-diego-moreira", title: "Diego Moreira", sport: "Football", ratio: 1.25 },
    { file: "axel-temperton", title: "Axel Temperton", sport: "Football", ratio: 1.778 },
    { file: "nico-paz", title: "Nico Paz", sport: "Football", ratio: 1.25 },
    { file: "4france-versus-islande-09-09", title: "France vs Islande", sport: "Football", ratio: 1.25 },
    { file: "steve-mandanda-retraite", title: "Steve Mandanda", sport: "Football", ratio: 1.25 },
    { file: "3france-azerbaidjan-10-10-25", title: "France vs Azerbaïdjan", sport: "Football", ratio: 1.25 },
    { file: "greg-vs-blois", title: "Greg Delain vs Blois", sport: "Football", ratio: 1.778 }
  ],

  /* Secteurs affichés dans le hero et la section services */
  sectors: ["restaurants", "artisans", "commerces", "instituts de beauté", "entreprises du BTP", "professions libérales", "clubs sportifs"],

  /* Rebrandings */
  clubs: [
    {
      id: "hac",
      name: "Le Havre AC",
      short: "HAC",
      sport: "Football",
      logo: "hac.png",
      desc: "Une identité nocturne et tranchante, bâtie sur le ciel et marine du club. Des chiffres géants pour les scores, une typo serrée pour les compositions.",
      files: ["jour-de-match", "groupe", "compo1", "compo2", "coup-d-envoi", "mi-temps", "goal", "goal2", "goal3", "victoire", "victoire-2", "fin-du-match", "prochain-match"],
      stories: []
    },
    {
      id: "fcv",
      name: "FC Versailles",
      short: "FCV",
      sport: "Football",
      logo: "fcv.png",
      desc: "Du bleu roi et du blanc, une typographie condensée et des photos plein cadre. Un univers sobre et affirmé, digne d'une ville royale.",
      files: ["matchday", "nextmatch", "versailles-compo", "versailles-compo1", "victoire"],
      stories: ["goal-story", "goal-story2"]
    },
    {
      id: "stb",
      name: "STB Le Havre",
      short: "STB",
      sport: "Basket",
      logo: "stb.png",
      desc: "Pour le basket havrais, une direction éditoriale : grandes capitales à empattements, noir profond et cadrages serrés, comme une couverture de magazine.",
      files: ["gametime-stb", "next-game", "score-du-match", "potm", "compo-publication", "calendrier", "post-insta"],
      stories: ["compo-story", "stb-compo-story"]
    }
  ],

  /* Sites web livrés.
     "captures" : jusqu'à 3 captures du site (format 16:10, 1280 x 800) déposées dans assets/img/web/.
     La première sert d'aperçu dans la liste des réalisations ; les trois apparaissent dans la galerie 3D.
     Sans capture, un aperçu stylisé est généré. */
  projects: [
    {
      slug: "institut-beaute-montivilliers",
      name: "Institut de Beauté",
      place: "Montivilliers",
      sector: "Beauté & bien-être",
      headline: "Révélez votre beauté naturelle",
      url: "https://institutdebeaute-montivilliers.fr",
      captures: ["institut-beaute-montivilliers-1.webp", "institut-beaute-montivilliers-2.webp", "institut-beaute-montivilliers-3.webp"],
      tone: ["#f3e6dc", "#2b1d18", "#c98a6b"]
    },
    {
      slug: "rmc-batiment",
      name: "RMC Bâtiment",
      place: "Évreux",
      sector: "Maçonnerie & rénovation",
      headline: "Maçonnerie générale et rénovation en Normandie",
      url: "https://www.rmcbatiment.fr/",
      captures: ["rmc-batiment-1.webp", "rmc-batiment-2.webp", "rmc-batiment-3.webp"],
      tone: ["#1c1f24", "#f1f1ee", "#e0a526"]
    }
    /* À ajouter quand les sites seront en ligne :
    { slug: "nh-services", name: "NH Services", place: "Le Havre", sector: "Nettoyage professionnel",
      url: "https://nh-services.net/", captures: ["nh-services-1.webp"], tone: ["#eaf3f8", "#0f2a3d", "#2a9bd6"] },
    { slug: "gilles-peinture", name: "Gilles Peinture", place: "Saint-Léonard", sector: "Peinture intérieure & extérieure",
      url: "", captures: ["gilles-peinture-1.webp"], tone: ["#f6f4ef", "#1d1d1b", "#3f7f5f"] }
    */
  ]
};
