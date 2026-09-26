# MetriKs Agency · site web

Site en ligne : https://metriksagency.com/

## Les pages

Le site compte neuf pages. L'accueil présente MetriKs en quelques sections courtes et renvoie vers une page par sujet : création de site internet, refonte, référencement local, identité visuelle, réalisations, méthode et espace client, clubs sportifs, contact. Chaque page a son adresse propre (par exemple metriksagency.com/referencement-local/), son titre Google, sa description et ses données structurées. Le fichier sitemap.xml liste toutes les pages pour Google.

## Ouvrir le site sur votre ordinateur

Un double-clic sur index.html ouvre le site, et les liens mènent à toutes les pages. Seule la galerie 3D de l'accueil reste bloquée par le navigateur : une image fixe la remplace. Pour la voir, lancez un petit serveur local. Dans le Terminal, tapez "cd" suivi d'un espace, glissez le dossier du site dans la fenêtre, validez, puis tapez "python3 -m http.server 8000" et ouvrez http://localhost:8000.

## Modifier les textes

Tous les textes des pages se trouvent dans _src/build-pages.mjs, page par page, avec les titres et descriptions Google. Après une modification, lancez "node _src/build-pages.mjs" depuis le dossier du site : la commande régénère index.html, les dossiers de pages et sitemap.xml. Si vous modifiez directement un fichier index.html, la prochaine génération écrasera votre changement : reportez-le aussi dans build-pages.mjs.

Pour mettre un passage en orange dans un paragraphe, entourez-le de hl("…") dans build-pages.mjs. Dans un titre, le mot entre balises em passe en orange gras.

## Modifier les visuels

Les sites clients, les affiches sport et les rebrandings de clubs se trouvent dans assets/js/data.js. Un nouveau projet ajouté là apparaît dans la galerie 3D de l'accueil, dans la liste des réalisations et, après génération, sur la page Réalisations (ajoutez son texte dans l'objet CASES de build-pages.mjs).

Pour une affiche, convertissez l'image en WebP à deux largeurs (640 et 1280 px) dans assets/img/posters, plus une version de 512 px dans assets/img/tex pour la galerie 3D. Nommez-les nom-640.webp, nom-1280.webp et nom-512.webp, puis ajoutez une ligne dans data.js. Pour un site client, déposez jusqu'à trois captures 16:10 (1280 x 800) dans assets/img/web et indiquez leurs noms dans le champ "captures" du projet.

## Style et couleurs

Le site utilise le style "harmonie" : Tactic en graisses légères, mot clé en Bold orange. Pour comparer, ajoutez à l'adresse ?style=classique (ancienne version en Tactic Ultra) ou ?palette=doux (fond prune et orange abricot).

## Technique

HTML, CSS et JavaScript sans framework. GSAP 3 (ScrollTrigger, SplitText) pour les animations et les transitions entre pages, Lenis pour le défilement fluide, Three.js pour la galerie de l'accueil. Tout est hébergé localement : aucun appel à un CDN. Le code source de la galerie se trouve dans _src/scene.js ; il est compilé dans assets/js/scene.js avec esbuild. Les anciennes adresses sport.html et business.html redirigent vers les pages Clubs sportifs et Création de site internet.
