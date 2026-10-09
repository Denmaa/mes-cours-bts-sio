// ==========================================================
// SCRIPT.JS — en-tête + menu (écrits UNE SEULE FOIS, ici)
// Pour ajouter une page au menu, ajoute une ligne dans PAGES.
// ==========================================================
const PAGES = [
  ["index.html",        "Accueil"],
  ["cejm.html",         "CEJM"],
  ["math.html",         "Math"],
  ["informatique.html", "Informatique"],
  ["culture-g.html",    "Culture G"],
  ["anglais.html",      "Anglais"],
  ["depose.html",       "Déposer un cours"],
];

// Nom de la page actuelle (index.html si l'adresse finit par /).
// Sur GitHub Pages l'adresse peut aussi être /math sans ".html" : on l'ajoute.
let pageActuelle = decodeURIComponent(location.pathname.split("/").pop()) || "index.html";
if (!pageActuelle.includes(".")) pageActuelle += ".html";

const liens = PAGES.map(([url, nom]) =>
  `<li><a href="${url}"${url === pageActuelle ? ' aria-current="page"' : ""}>${nom}</a></li>`
).join("");

document.body.insertAdjacentHTML("afterbegin", `
  <header class="site-header">
    <button class="menu-btn" id="menu-btn" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="menu">☰</button>
    <a class="site-title" href="index.html">Mes cours — BTS SIO</a>
  </header>
  <nav class="menu" id="menu" aria-label="Menu principal">
    <div class="menu-top">
      <strong>Menu</strong>
      <button class="menu-btn" id="menu-close" aria-label="Fermer le menu">✕</button>
    </div>
    <ul>${liens}</ul>
  </nav>
  <div class="overlay" id="overlay"></div>
`);

// Ouverture / fermeture du menu
const bouton  = document.getElementById("menu-btn");
const menu    = document.getElementById("menu");
const overlay = document.getElementById("overlay");
const fermer  = document.getElementById("menu-close");

function ouvrirMenu() {
  menu.classList.add("ouvert");
  overlay.classList.add("visible");
  bouton.setAttribute("aria-expanded", "true");
  fermer.focus();
}

function fermerMenu() {
  menu.classList.remove("ouvert");
  overlay.classList.remove("visible");
  bouton.setAttribute("aria-expanded", "false");
  bouton.focus();
}

bouton.addEventListener("click", ouvrirMenu);
fermer.addEventListener("click", fermerMenu);
overlay.addEventListener("click", fermerMenu);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("ouvert")) fermerMenu();
});
