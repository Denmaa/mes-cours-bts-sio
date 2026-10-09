# mes-cours-bts-sio

Carnet de cours du BTS SIO : un petit site statique (HTML, CSS, JavaScript, sans framework).

## Organisation

```
cours_bts-sio/
├── index.html          Accueil (cartes vers les matières)
├── cejm.html           CEJM
├── math.html           Math + outils (convertisseur, calculatrice binaire)
├── informatique.html   Informatique (3 parties)
├── culture-g.html      Culture G (SIO-A, SIO-B, sujet de la promo)
├── anglais.html        Anglais (dont la méthode de l'épreuve écrite)
├── depose.html         Lien vers le formulaire de dépôt
├── favicon.ico
├── css/
│   ├── style.css       Style commun à tout le site (une couleur par matière)
│   └── outils.css      Style des outils interactifs de la page Math
└── js/
    ├── script.js       En-tête + menu, ajoutés automatiquement sur chaque page
    ├── convertisseur.js    Convertisseur décimal / binaire / hexadécimal
    └── calcul-binaire.js   Calculatrice binaire (+ − × ÷) avec le calcul posé
```

## Ajouter un cours

Dans la page de la matière, copie un bloc `<article class="course">…</article>` à l'endroit
indiqué par le commentaire `AJOUTER LES COURS ICI`. Enlève la classe `vide` quand le bloc a du contenu.

## Ajouter une page

1. Copie une page existante (par exemple `cejm.html`) et change le titre et la classe du `<body>`.
2. Ajoute une ligne dans le tableau `PAGES` de `js/script.js` pour qu'elle apparaisse dans le menu.
3. Ajoute la couleur de la matière dans `css/style.css` (`body.ma-matiere { … }`).
