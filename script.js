const PIECES = [
  {
    id: "sable",
    index: "01",
    category: "Living",
    name: "The Sable Set",
    price: "₹2,48,000",
    word: "Handmade",
    corner: ["Large", "sofas"],
    bright: false,
    blurb: "A six-seat sheesham room. Teak oil, cream linen, and tables in the same timber.",
    details: [
      "Solid sheesham, teak oil finish.",
      "Three-seater, two-seater, and an armchair.",
      "Cream linen. Matching tables, ₹46,000."
    ],
    message: "Hello Orra, I would like to enquire about The Sable Set, seating at ₹2,48,000."
  },
  {
    id: "reed",
    index: "02",
    category: "Beside the sofa",
    name: "The Reed Stand",
    price: "₹24,800",
    word: "Quiet",
    corner: ["Side", "tables"],
    bright: true,
    blurb: "Bamboo, with arched shelves, made to sit at the arm of a sofa.",
    details: [
      "Solid bamboo, natural finish.",
      "Arched shelves for books, a square top.",
      "Made to sit against the arm of a sofa."
    ],
    message: "Hello Orra, I would like to enquire about The Reed Stand at ₹24,800."
  },
  {
    id: "arc",
    index: "03",
    category: "Library",
    name: "The Arc Library",
    price: "₹1,86,000",
    word: "Sculpted",
    corner: ["One", "curve"],
    bright: false,
    blurb: "Walnut in a continuous curve. Open shelves, brass legs, sized to the wall.",
    details: [
      "Walnut, drawn as one continuous curve.",
      "Open compartments, slender brass legs.",
      "About 240 cm, sized to your wall."
    ],
    message: "Hello Orra, I would like to enquire about The Arc Library at ₹1,86,000."
  },
  {
    id: "burgundy",
    index: "04",
    category: "Salon",
    name: "The Burgundy Salon",
    price: "₹2,22,000",
    word: "Tufted",
    corner: ["Wine", "velvet"],
    bright: false,
    blurb: "Wine velvet, sofa and chaise, with teal and ochre cushions.",
    details: [
      "Cotton velvet, deep wine.",
      "Sofa and chaise, teal and ochre cushions.",
      "Separately: sofa ₹1,48,000, chaise ₹74,000."
    ],
    message: "Hello Orra, I would like to enquire about The Burgundy Salon at ₹2,22,000 for the sofa and chaise."
  },
  {
    id: "table",
    index: "05",
    category: "Dining",
    name: "The Long Table",
    price: "₹1,64,000",
    word: "Gather",
    corner: ["Long", "tables"],
    bright: true,
    blurb: "Solid walnut, one long top and two benches, for the late light.",
    details: [
      "Walnut, hand-rubbed oil.",
      "Table and two benches, about 240 cm.",
      "Seats eight."
    ],
    message: "Hello Orra, I would like to enquire about The Long Table at ₹1,64,000."
  }
];

const INTERVAL = 2000;
const phone = String(window.ORRA_WHATSAPP || "").replace(/\D/g, "");

function waHref(text) {
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
}

document.querySelectorAll("[data-wa]").forEach((node) => {
  node.href = waHref(node.getAttribute("data-wa-text") || "Hello Orra.");
  node.target = "_blank";
  node.rel = "noopener";
});

const footerWa = document.getElementById("footer-wa");
const contactWa = document.getElementById("contact-wa");
if (phone.length >= 8) {
  const pretty = "+" + phone.slice(0, phone.length - 10) + " " + phone.slice(-10, -5) + " " + phone.slice(-5);
  footerWa.textContent = pretty;
  if (contactWa) contactWa.textContent = pretty;
}

const studio = window.ORRA_STUDIO || {};
const addressLines = Array.isArray(studio.lines) ? studio.lines.filter(Boolean) : [];
const addressEl = document.getElementById("contact-address");
if (addressEl) {
  const name = document.createElement("strong");
  name.textContent = studio.name || "Orra Atelier";
  addressEl.replaceChildren(name);
  addressLines.forEach((line) => {
    addressEl.appendChild(document.createElement("br"));
    addressEl.appendChild(document.createTextNode(line));
  });
}
const hoursEl = document.getElementById("contact-hours");
if (hoursEl && studio.hours) hoursEl.textContent = studio.hours;
const emailEl = document.getElementById("contact-email");
if (emailEl && studio.email) {
  emailEl.textContent = studio.email;
  emailEl.href = "mailto:" + studio.email;
}
const mapEl = document.getElementById("contact-map");
if (mapEl && addressLines.length) {
  const query = [studio.name].concat(addressLines).filter(Boolean).join(", ");
  mapEl.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
  mapEl.target = "_blank";
  mapEl.rel = "noopener";
}

const track = document.getElementById("track");
const ticks = document.getElementById("ticks");
const meta = document.getElementById("hero-meta");
const pauseBtn = document.getElementById("pause");
const hero = document.querySelector(".hero");

let index = 0;
let userPaused = false;
let holdPaused = false;
let acc = 0;
let last = performance.now();
let fadeTimer = 0;
let renderToken = 0;

PIECES.forEach((piece, i) => {
  const tick = document.createElement("button");
  tick.type = "button";
  tick.className = "page-btn";
  tick.setAttribute("role", "tab");
  tick.setAttribute("aria-label", piece.name);
  tick.innerHTML = "<b>" + piece.index + "</b><span></span>";
  tick.addEventListener("click", () => go(i, true));
  ticks.appendChild(tick);
});

function paintTicks() {
  ticks.querySelectorAll(".page-btn").forEach((tick, i) => {
    const on = i === index;
    tick.classList.toggle("is-on", on);
    tick.setAttribute("aria-selected", on ? "true" : "false");
    const bar = tick.querySelector("span");
    bar.style.animation = "none";
    void bar.offsetWidth;
    bar.style.animation = "";
  });
  syncFreeze();
}

let lastBasis = 0;

function layoutFrames() {
  const stage = document.getElementById("stage");
  const width = Math.round(stage.getBoundingClientRect().width);
  if (!width) return;
  const basis = width + 2;
  if (basis !== lastBasis) {
    lastBasis = basis;
    document.querySelectorAll(".frame").forEach((frame) => {
      frame.style.flexBasis = basis + "px";
    });
  }
  track.style.transform = "translate3d(-" + index * basis + "px,0,0)";
}

function render(animate) {
  const token = ++renderToken;
  const piece = PIECES[index];
  layoutFrames();
  paintTicks();
  const apply = () => {
    if (token !== renderToken) return;
    document.getElementById("hero-word").textContent = piece.word;
    const corner = document.getElementById("hero-corner");
    corner.replaceChildren();
    piece.corner.forEach((line, i) => {
      if (i) corner.appendChild(document.createElement("br"));
      corner.appendChild(document.createTextNode(line));
    });
    document.getElementById("hero-name").textContent = piece.name;
    document.getElementById("hero-blurb").textContent = piece.blurb;
    document.getElementById("hero-price").textContent = piece.price;
    const wa = document.getElementById("hero-wa");
    wa.href = waHref(piece.message);
    wa.target = "_blank";
    wa.rel = "noopener";
    document.getElementById("hero-more").href = "#" + piece.id;
    hero.classList.toggle("is-bright", piece.bright);
    meta.classList.remove("is-fading");
  };
  if (!animate) {
    apply();
    return;
  }
  meta.classList.add("is-fading");
  clearTimeout(fadeTimer);
  fadeTimer = setTimeout(apply, 160);
}

function go(next, animate) {
  index = (next + PIECES.length) % PIECES.length;
  acc = 0;
  render(animate);
}

function paused() {
  return userPaused || holdPaused || document.hidden;
}

function syncFreeze() {
  ticks.querySelectorAll(".page-btn").forEach((tick, i) => {
    tick.classList.toggle("is-frozen", i === index && paused());
  });
}

function frame(now) {
  const dt = Math.min(80, now - last);
  last = now;
  if (!paused()) acc += dt;
  if (acc >= INTERVAL) go(index + 1, true);
  requestAnimationFrame(frame);
}

document.getElementById("next").addEventListener("click", () => go(index + 1, true));
document.getElementById("prev").addEventListener("click", () => go(index - 1, true));
pauseBtn.addEventListener("click", () => {
  userPaused = !userPaused;
  pauseBtn.textContent = userPaused ? "Play" : "Pause";
  pauseBtn.setAttribute("aria-pressed", userPaused ? "true" : "false");
  syncFreeze();
});

const heroNote = document.querySelector(".hero-note");
heroNote.addEventListener("mouseenter", () => { holdPaused = true; syncFreeze(); });
heroNote.addEventListener("mouseleave", () => { holdPaused = false; syncFreeze(); });
heroNote.addEventListener("focusin", () => { holdPaused = true; syncFreeze(); });
heroNote.addEventListener("focusout", () => { holdPaused = false; syncFreeze(); });
document.addEventListener("visibilitychange", syncFreeze);

hero.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") go(index + 1, true);
  if (event.key === "ArrowLeft") go(index - 1, true);
});

let touchX = null;
document.getElementById("stage").addEventListener("touchstart", (event) => {
  touchX = event.changedTouches[0].clientX;
}, { passive: true });
document.getElementById("stage").addEventListener("touchend", (event) => {
  if (touchX == null) return;
  const dx = event.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
  touchX = null;
}, { passive: true });

const heldKey = "orra-held";
const held = new Set(JSON.parse(localStorage.getItem(heldKey) || "[]"));
const heldBar = document.getElementById("held");

function paintHeld() {
  document.querySelectorAll(".hold").forEach((button) => {
    const on = held.has(button.getAttribute("data-hold"));
    button.classList.toggle("is-held", on);
    button.textContent = on ? "Held" : "Hold this piece";
  });
  heldBar.hidden = held.size === 0;
  document.getElementById("held-count").textContent = String(held.size);
  document.getElementById("nav-cart").textContent = held.size ? "Cart " + held.size : "Cart";
  localStorage.setItem(heldKey, JSON.stringify([...held]));
}

const nav = document.querySelector(".nav");
function paintNav() {
  nav.classList.toggle("is-solid", window.scrollY > hero.offsetHeight - 70);
}
paintNav();
window.addEventListener("scroll", paintNav, { passive: true });

const searchForm = document.getElementById("nav-search");
const searchInput = document.getElementById("search-input");
document.getElementById("search-open").addEventListener("click", () => {
  searchForm.hidden = false;
  searchInput.focus();
  document.getElementById("catalog").scrollIntoView();
});
searchInput.addEventListener("input", () => {
  catalogQuery = searchInput.value.trim().toLowerCase();
  document.querySelectorAll(".piece").forEach((piece) => {
    piece.hidden = catalogQuery.length > 0 && !piece.textContent.toLowerCase().includes(catalogQuery);
  });
  paintCatalog();
});
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));
    searchForm.hidden = true;
  }
});

document.querySelectorAll(".hold").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.getAttribute("data-hold");
    if (held.has(name)) held.delete(name);
    else held.add(name);
    paintHeld();
  });
});

document.getElementById("held-clear").addEventListener("click", () => {
  held.clear();
  paintHeld();
});

document.getElementById("held-send").addEventListener("click", () => {
  const text = "Hello Orra, please hold these for me: " + [...held].join(", ") + ".";
  window.open(waHref(text), "_blank", "noopener");
});

document.getElementById("enquire").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const text = [
    "Hello Orra, I am " + (data.get("name") || "").toString().trim() + ".",
    "Piece: " + data.get("piece"),
    "The room: " + ((data.get("note") || "").toString().trim() || "—")
  ].join("\n");
  window.open(waHref(text), "_blank", "noopener");
});

const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (motion.matches) {
  userPaused = true;
  pauseBtn.textContent = "Play";
  pauseBtn.setAttribute("aria-pressed", "true");
}

render(false);
paintHeld();
new ResizeObserver(() => layoutFrames()).observe(document.getElementById("stage"));
requestAnimationFrame(frame);

const CATALOG = [
  { id: "sable", cat: "Seating", name: "The Sable Set", price: "₹2,48,000", image: "images/sable.jpg?v=2", alt: "Cream linen sofas and an armchair in walnut.", story: "A six-seat living room in solid sheesham. The frames are cut square, the cloth is a cream weave, and the tables are the same timber.", specs: [["Timber", "Solid sheesham, teak oil"], ["Seating", "Three-seater, two-seater, armchair"], ["Cloth", "Cream weave, loose cushions"], ["Tables", "Coffee table and console, ₹46,000"], ["Lead", "Five to seven weeks"]], message: "Hello Orra, I would like to enquire about The Sable Set, seating at ₹2,48,000." },
  { id: "chair", cat: "Seating", name: "The Low Chair", price: "₹68,000", image: "images/chair.jpg", alt: "A low walnut lounge chair with a cream linen cushion.", story: "A chair for the end of the day. The frame is walnut, the seat and back are a deep cream linen, and it sits low enough that the room stays quiet.", specs: [["Timber", "Walnut, hand-rubbed oil"], ["Cloth", "Cream linen, loose cushion"], ["Size", "W 78 × D 86 × H 74 cm"], ["Lead", "Four weeks"]], message: "Hello Orra, I would like to enquire about The Low Chair at ₹68,000." },
  { id: "ottoman", cat: "Seating", name: "The Ottoman", price: "₹28,500", image: "images/ottoman.jpg", alt: "A walnut ottoman with a thick cream cushion.", story: "The companion to the low chair, or a seat on its own. A thick cream cushion on a walnut plinth.", specs: [["Timber", "Walnut"], ["Cloth", "Cream weave"], ["Size", "W 80 × D 60 × H 42 cm"], ["Lead", "Three weeks"]], message: "Hello Orra, I would like to enquire about The Ottoman at ₹28,500." },
  { id: "burgundy", cat: "Seating", name: "The Burgundy Salon", price: "₹2,22,000", image: "images/burgundy.jpg?v=2", alt: "A wine velvet sofa and chaise.", story: "Tufted velvet in a deep wine, with a chaise to match. Teal and ochre cushions come with the set.", specs: [["Cloth", "Cotton velvet, wine"], ["Form", "Sofa and chaise"], ["With it", "Teal and ochre cushions"], ["Separately", "Sofa ₹1,48,000 · chaise ₹74,000"], ["Lead", "Six to eight weeks"]], message: "Hello Orra, I would like to enquire about The Burgundy Salon at ₹2,22,000 for the sofa and chaise." },
  { id: "bench", cat: "Seating", name: "The Hall Bench", price: "₹54,000", image: "images/bench.jpg", alt: "A long walnut bench with a tan leather seat.", story: "A backless bench for the hall or the foot of a bed. Walnut, with a slim leather seat in a warm tan.", specs: [["Timber", "Walnut"], ["Seat", "Tan leather"], ["Size", "L 160 × D 40 × H 46 cm"], ["Lead", "Four weeks"]], message: "Hello Orra, I would like to enquire about The Hall Bench at ₹54,000." },
  { id: "reed", cat: "Tables", name: "The Reed Stand", price: "₹24,800", image: "images/bamboo.jpg?v=2", alt: "A bamboo side stand with arched shelves.", story: "A bamboo stand for the arm of a sofa. Arched shelves for books, and a top wide enough for a cup.", specs: [["Material", "Solid bamboo, natural finish"], ["Form", "Arched shelves, square top"], ["Use", "Beside a sofa"], ["Lead", "Three weeks"]], message: "Hello Orra, I would like to enquire about The Reed Stand at ₹24,800." },
  { id: "round", cat: "Tables", name: "The Round", price: "₹46,000", image: "images/round.jpg", alt: "A low round walnut coffee table.", story: "A low drum of solid walnut. Thick enough that it does not need a lower shelf, and wide enough for a bowl and the evening.", specs: [["Timber", "Solid walnut, oil"], ["Size", "Diameter 100 × H 32 cm"], ["Top", "One piece"], ["Lead", "Five weeks"]], message: "Hello Orra, I would like to enquire about The Round at ₹46,000." },
  { id: "console", cat: "Tables", name: "The Console", price: "₹38,000", image: "images/console.jpg", alt: "A long walnut console table against a wood wall.", story: "A long narrow table for the wall behind a sofa, or the hall. One walnut top, two slab legs, nothing else.", specs: [["Timber", "Walnut"], ["Size", "L 180 × D 36 × H 78 cm"], ["Use", "Hall or behind a sofa"], ["Lead", "Four weeks"]], message: "Hello Orra, I would like to enquire about The Console at ₹38,000." },
  { id: "nest", cat: "Tables", name: "The Nest", price: "₹32,000", image: "images/nest.jpg", alt: "Two nesting round walnut tables.", story: "Two round tables, one smaller, so they sit together or apart. The pair is the price.", specs: [["Timber", "Walnut"], ["Larger", "Diameter 50 × H 52 cm"], ["Smaller", "Diameter 40 × H 42 cm"], ["Lead", "Four weeks"]], message: "Hello Orra, I would like to enquire about The Nest, the pair, at ₹32,000." },
  { id: "desk", cat: "Tables", name: "The Writing Desk", price: "₹92,000", image: "images/desk.jpg", alt: "A walnut writing desk and chair by a window.", story: "A desk with two drawers and the chair that belongs to it. Made to sit by a window, not in the middle of a room.", specs: [["Timber", "Walnut"], ["Desk", "L 140 × D 60 × H 75 cm"], ["With it", "Chair, cream linen seat"], ["Lead", "Six weeks"]], message: "Hello Orra, I would like to enquire about The Writing Desk at ₹92,000, with the chair." },
  { id: "table", cat: "Tables", name: "The Long Table", price: "₹1,64,000", image: "images/table.jpg?v=2", alt: "A long walnut dining table with two benches.", story: "One walnut top and two benches. It seats eight, and the length can be cut to the room.", specs: [["Timber", "Solid walnut, oil"], ["Seats", "Eight"], ["Length", "About 240 cm"], ["With it", "Two benches"], ["Lead", "Six to eight weeks"]], message: "Hello Orra, I would like to enquire about The Long Table at ₹1,64,000." },
  { id: "arc", cat: "Storage", name: "The Arc Library", price: "₹1,86,000", image: "images/arc.jpg?v=2", alt: "A curved walnut bookcase on brass legs.", story: "A library drawn as one continuous curve. Open compartments, and brass legs thin enough that the wood seems to rest above the floor.", specs: [["Timber", "Walnut, hand-rubbed oil"], ["Form", "Continuous curve"], ["Legs", "Slender brass"], ["Span", "Sized to the wall, from about 240 cm"], ["Lead", "Eight to ten weeks"]], message: "Hello Orra, I would like to enquire about The Arc Library at ₹1,86,000." },
  { id: "sideboard", cat: "Storage", name: "The Sideboard", price: "₹1,28,000", image: "images/sideboard.jpg", alt: "A long walnut sideboard with four doors.", story: "Four doors, brass pulls, and a top deep enough for the vessels you actually own. It is the storage for a dining room.", specs: [["Timber", "Walnut"], ["Size", "L 200 × D 48 × H 75 cm"], ["Inside", "Two adjustable shelves"], ["Hardware", "Brass pulls"], ["Lead", "Seven weeks"]], message: "Hello Orra, I would like to enquire about The Sideboard at ₹1,28,000." },
  { id: "chest", cat: "Storage", name: "The Tall Chest", price: "₹86,000", image: "images/chest.jpg", alt: "A tall walnut chest of five drawers.", story: "Five drawers in a tall walnut chest. Small brass knobs, and a plinth so it does not sit hard on the floor.", specs: [["Timber", "Walnut"], ["Drawers", "Five"], ["Size", "W 80 × D 45 × H 120 cm"], ["Lead", "Six weeks"]], message: "Hello Orra, I would like to enquire about The Tall Chest at ₹86,000." },
  { id: "daybed", cat: "Bedroom", name: "The Daybed", price: "₹1,42,000", image: "images/daybed.jpg", alt: "A low walnut daybed with an oatmeal linen cushion.", story: "A daybed for the room that is not quite a bedroom. Walnut base, oatmeal linen cushion, one bolster.", specs: [["Timber", "Walnut"], ["Cloth", "Oatmeal linen"], ["Size", "L 200 × W 90 × H 40 cm"], ["Lead", "Six weeks"]], message: "Hello Orra, I would like to enquire about The Daybed at ₹1,42,000." },
  { id: "bedside", cat: "Bedroom", name: "The Bedside", price: "₹42,000", image: "images/bedside.jpg", alt: "A pair of walnut bedside tables.", story: "A pair of bedside tables, each with one drawer. The price is for both.", specs: [["Timber", "Walnut"], ["Each", "W 55 × D 40 × H 50 cm"], ["Drawer", "One, brass pull"], ["Lead", "Four weeks"]], message: "Hello Orra, I would like to enquire about The Bedside, the pair, at ₹42,000." },
  { id: "bed", cat: "Bedroom", name: "The Frame", price: "₹1,72,000", image: "images/bed.jpg", alt: "A low walnut platform bed with oatmeal linen.", story: "A low platform and a plain headboard in walnut. The linen in the photograph is for scale. The price is the frame.", specs: [["Timber", "Walnut"], ["Sleeps", "180 × 200 cm"], ["Headboard", "Plain, 90 cm high"], ["Note", "Mattress and linen are separate"], ["Lead", "Eight weeks"]], message: "Hello Orra, I would like to enquire about The Frame, the bed, at ₹1,72,000." }
];

let catalogFilter = "all";
let catalogQuery = "";

function paintCatalog() {
  let shown = 0;
  document.querySelectorAll("#catalog-grid .card").forEach((card) => {
    const catOk = catalogFilter === "all" || card.getAttribute("data-cat") === catalogFilter;
    const qOk = !catalogQuery || card.textContent.toLowerCase().includes(catalogQuery);
    card.hidden = !(catOk && qOk);
    if (!card.hidden) shown += 1;
  });
  const empty = document.getElementById("catalog-empty");
  if (empty) empty.hidden = shown !== 0;
}

function showDetail(id) {
  const piece = CATALOG.find((item) => item.id === id);
  if (!piece) return;
  const detail = document.getElementById("detail");
  const specs = piece.specs.map((row) => "<div><dt>" + row[0] + "</dt><dd>" + row[1] + "</dd></div>").join("");
  detail.hidden = false;
  detail.innerHTML = ""
    + "<img src=\"" + piece.image + "\" alt=\"" + piece.alt + "\">"
    + "<div><p class=\"eyebrow\">" + piece.cat + "</p>"
    + "<h3>" + piece.name + "</h3>"
    + "<p class=\"price\">" + piece.price + "</p>"
    + "<p class=\"story\">" + piece.story + "</p>"
    + "<dl>" + specs + "</dl>"
    + "<div class=\"piece-actions\">"
    + "<a class=\"btn\" href=\"" + waHref(piece.message) + "\" target=\"_blank\" rel=\"noopener\">Enquire on WhatsApp</a>"
    + "<button type=\"button\" class=\"btn ghost hold\" data-hold=\"" + piece.name + "\">Hold this piece</button>"
    + "</div></div>";
  paintHeld();
  detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  grid.innerHTML = CATALOG.map((piece) => ""
    + "<button type=\"button\" class=\"card\" data-open=\"" + piece.id + "\" data-cat=\"" + piece.cat + "\">"
    + "<img src=\"" + piece.image + "\" alt=\"" + piece.alt + "\">"
    + "<p>" + piece.cat + "</p>"
    + "<h3>" + piece.name + "</h3>"
    + "<p class=\"price\">" + piece.price + "</p>"
    + "</button>").join("");
  const empty = document.createElement("p");
  empty.id = "catalog-empty";
  empty.className = "catalog-empty";
  empty.hidden = true;
  empty.textContent = "Nothing under that name. Try another word, or show all.";
  grid.after(empty);
  const select = document.querySelector("#enquire select");
  select.innerHTML = CATALOG.map((piece) => "<option>" + piece.name + "</option>").join("") + "<option>A whole room</option>";
}

document.querySelector(".filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  catalogFilter = button.getAttribute("data-filter");
  document.querySelectorAll(".filters button").forEach((item) => {
    item.classList.toggle("is-on", item === button);
  });
  paintCatalog();
});

document.getElementById("catalog-grid").addEventListener("click", (event) => {
  const card = event.target.closest("[data-open]");
  if (card) showDetail(card.getAttribute("data-open"));
});

document.getElementById("detail").addEventListener("click", (event) => {
  const button = event.target.closest(".hold");
  if (!button) return;
  const name = button.getAttribute("data-hold");
  if (held.has(name)) held.delete(name);
  else held.add(name);
  paintHeld();
});

renderCatalog();
paintCatalog();
