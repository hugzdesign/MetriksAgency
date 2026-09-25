# MetriKs Agency — site web

Site en ligne : https://metriksagency.com/

Ouvrir le site
Un double-clic sur index.html ouvre le site, mais le navigateur bloque alors le stade 3D : une affiche fixe le remplace. Pour tout voir, lancez un petit serveur local depuis ce dossier. Dans le Terminal, tapez "cd" suivi d'un espace, glissez le dossier refonte-2026 dans la fenêtre, validez, puis tapez "python3 -m http.server 8000" et ouvrez http://localhost:8000. Pour publier, envoyez tout le contenu du dossier refonte-2026 sur votre hébergeur.

Modifier le contenu
Tout le contenu éditable se trouve dans assets/js/data.js : les sites clients (qui apparaissent aussi dans la galerie 3D du haut de page), les affiches sport, les rebrandings de clubs et les secteurs qui défilent dans le titre. Les textes des sections restent dans index.html.

Ajouter une affiche
Convertissez l'image en WebP à deux largeurs (640 et 1280 px) dans assets/img/posters, plus une version de 512 px dans assets/img/tex pour le stade 3D. Nommez-les nom-640.webp, nom-1280.webp et nom-512.webp, puis ajoutez une ligne dans data.js.

Captures des sites clients
Sans capture, chaque projet affiche un aperçu stylisé. Pour montrer le vrai site, déposez une capture 16:10 (1440 x 900 conseillé) dans assets/img/web, puis indiquez son nom dans le champ "capture" du projet. La capture remplace alors l'aperçu dans la liste des réalisations et sur l'écran principal du projet dans la galerie 3D.

À vérifier avant la mise en ligne
L'adresse de RMC Bâtiment (rmcbatiment.fr) est à confirmer. Les liens de NH Services et de Gilles Peinture sont vides : ajoutez-les s'ils sont en ligne. Le bouton de contact ouvre un e-mail vers contact@metriksagency.com.

Style et couleurs
Le site utilise le style "harmonie" : Tactic en graisses légères, titres en minuscules, mot clé en Bold orange. Pour comparer, ajoutez à l'adresse ?style=classique (ancienne version en Tactic Ultra) ou ?palette=doux (fond prune et orange abricot). Le réglage par défaut se trouve sur la balise <html> de index.html.

Technique
HTML, CSS et JavaScript sans framework. GSAP 3 (ScrollTrigger, SplitText) pour les animations, Lenis pour le défilement fluide, Three.js pour le stade du hero. Tout est hébergé localement : aucun appel à un CDN. Le code source du stade se trouve dans _src/scene.js ; il est compilé dans assets/js/scene.js avec esbuild.
