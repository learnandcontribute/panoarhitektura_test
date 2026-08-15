/* ============================================================
   PANO arhitektura — shared data + behaviour
   One file, loaded by every page. Each page runs only the
   parts relevant to the elements it actually contains.
   ============================================================ */

/* ---------------- content data ---------------- */
/* id is used in the URL: izdvojeno.html?id=p1 */
const PROJEKTI = [
  { id:"p1", t:"Kuća uz more — Volosko", god:"2025", lok:"Volosko, Rijeka", tip:"Stambeno",
    sta:"Realizirano", pov:"210 m²", aut:"PANO", sur:"Statika d.o.o.",
    img:"assets/p1.jpg", gallery:["assets/p1.jpg","assets/p5.jpg","assets/p2.jpg"] },
  { id:"p2", t:"Kuća pod crkvom", god:"2024", lok:"Zagorje", tip:"Stambeno",
    sta:"Realizirano", pov:"185 m²", aut:"PANO", sur:"—",
    img:"assets/p2.jpg", gallery:["assets/p2.jpg","assets/p1.jpg","assets/p3.jpg"] },
  { id:"p3", t:"Drvena kuća u šumi", god:"2024", lok:"Gorski kotar", tip:"Stambeno",
    sta:"U izgradnji", pov:"140 m²", aut:"PANO", sur:"IGH",
    img:"assets/p3.jpg", gallery:["assets/p3.jpg","assets/p1.jpg","assets/p2.jpg"] }
];

const OBJEKTI = [
  { id:"o1", t:"Uredi Comsysto Reply", god:"2025", lok:"Zagreb", tip:"Interijer",
    sta:"Realizirano", pov:"—", aut:"PANO", sur:"Bosnić+Dorotić",
    img:"assets/o1.jpg", gallery:["assets/o1.jpg"] },
  { id:"o2", t:"Polica MODUL", god:"2024", lok:"—", tip:"Namještaj",
    sta:"Serija", pov:"—", aut:"PANO", sur:"—", img:"", gallery:[] },
  { id:"o3", t:"Svjetiljka LUX", god:"2024", lok:"—", tip:"Rasvjeta",
    sta:"Prototip", pov:"—", aut:"PANO", sur:"—", img:"", gallery:[] }
];

const NEWS = [
  { d:"12.06.2026", h:"Nagrada za projekt Volosko", p:"Kuća uz more dobila je regionalnu nagradu za stambenu arhitekturu." },
  { d:"04.04.2026", h:"Izložba — Objekti PANO", p:"Serija namještaja predstavljena na sajmu dizajna u Zagrebu." },
  { d:"20.01.2026", h:"Kuća u šumi — početak radova", p:"Započela izgradnja drvene kuće u Gorskom kotaru." }
];

/* find any item by id across both collections */
function findItem(id){
  return PROJEKTI.concat(OBJEKTI).find(x => x.id === id);
}

/* ---------------- render helpers ---------------- */
function photoCard(item, backTo){
  const media = item.img
    ? `<div class="thumb"><img src="${item.img}" alt="${item.t}"></div>`
    : `<div class="thumb"><div class="ph" style="width:100%;height:100%"><span>${item.t}</span></div></div>`;
  return `<a class="pcard" href="izdvojeno.html?id=${item.id}${backTo?`&from=${backTo}`:""}">
    ${media}
    <div class="cap"><span>${item.t}</span><span class="sub mono">${item.god}</span></div>
  </a>`;
}

function renderGrid(targetId, data, backTo){
  const el = document.getElementById(targetId);
  if(!el) return;
  el.innerHTML = data.map(x => photoCard(x, backTo)).join("");
}

function renderNews(targetId){
  const el = document.getElementById(targetId);
  if(!el) return;
  el.innerHTML = NEWS.map(n =>
    `<a class="news-row" href="news.html">
       <div class="date mono">${n.d}</div>
       <div><h3>${n.h}</h3><p>${n.p}</p></div>
     </a>`).join("");
}

/* ---------------- Pano Projects "+" toggle ---------------- */
function initPlusToggle(){
  const plus = document.getElementById("pp-plus");
  const links = document.getElementById("pp-links");
  if(!plus || !links) return;
  plus.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    plus.classList.toggle("open", open);
    links.setAttribute("aria-hidden", open ? "false" : "true");
    plus.setAttribute("aria-label", open ? "Zatvori izbornik" : "Prikaži izbornik");
  });
}

/* ---------------- single project page ---------------- */
let slideN = 0, slides = [];

function initProjectPage(){
  const stage = document.getElementById("slide-img");
  if(!stage) return; /* not the project page */

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const from = params.get("from");
  const item = findItem(id) || PROJEKTI[0];

  document.getElementById("proj-title").textContent = item.t;

  const hero = document.getElementById("proj-hero-img");
  if(item.img){ hero.src = item.img; hero.alt = item.t; }

  document.getElementById("m-god").textContent = item.god;
  document.getElementById("m-lok").textContent = item.lok;
  document.getElementById("m-tip").textContent = item.tip;
  document.getElementById("m-sta").textContent = item.sta;
  document.getElementById("m-pov").textContent = item.pov;
  document.getElementById("m-aut").textContent = item.aut;
  document.getElementById("m-sur").textContent = item.sur;

  /* back link points where the user came from */
  const back = document.getElementById("proj-back");
  if(from === "objekti"){ back.href = "objects.html"; back.textContent = "← natrag na Objekte"; }
  else { back.href = "projects.html"; back.textContent = "← natrag na Projekte"; }

  /* slideshow */
  slides = (item.gallery && item.gallery.length) ? item.gallery : (item.img ? [item.img] : []);
  slideN = 0;
  buildThumbs();
  updateSlide();

  document.getElementById("slide-prev").addEventListener("click", () => slide(-1));
  document.getElementById("slide-next").addEventListener("click", () => slide(1));
  document.addEventListener("keydown", e => {
    if(e.key === "ArrowLeft") slide(-1);
    if(e.key === "ArrowRight") slide(1);
  });
}

function buildThumbs(){
  const wrap = document.getElementById("thumbs");
  if(!wrap) return;
  wrap.innerHTML = slides.map((src,k) =>
    `<div class="t ${k===0?"act":""}" data-k="${k}"><img src="${src}" alt=""></div>`).join("");
  wrap.querySelectorAll(".t").forEach(t =>
    t.addEventListener("click", () => { slideN = +t.dataset.k; updateSlide(); }));
}

function updateSlide(){
  const img = document.getElementById("slide-img");
  if(!img || !slides.length) return;
  img.src = slides[slideN];
  const pad = String(slideN+1).padStart(2,"0");
  document.getElementById("slide-count").textContent = pad + " / " + String(slides.length).padStart(2,"0");
  document.querySelectorAll("#thumbs .t").forEach((t,k) => t.classList.toggle("act", k===slideN));
}

function slide(d){
  if(!slides.length) return;
  slideN = (slideN + d + slides.length) % slides.length;
  updateSlide();
}

/* ---------------- boot ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderGrid("grid-projekti", PROJEKTI, "projekti");
  renderGrid("grid-objekti", OBJEKTI, "objekti");
  renderNews("news-list");
  initPlusToggle();
  initProjectPage();
});
