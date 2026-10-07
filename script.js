// Menu latéral : ouvrir / fermer
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
