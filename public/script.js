/* ==========================================================
   Florea Virágüzlet – tartalom és működés
   Az alábbi SHOP, PRODUCTS és GALLERY objektumok szerkesztésével
   frissíthetők az elérhetőségek, a nyitvatartás, a kollekció és a fotók.
   Ami null vagy üres, azt az oldal egyszerűen nem mutatja.
   Módosítás után futtasd:  node tools/prerender.js
   ========================================================== */

const SHOP = {
  name: "Florea Virágüzlet",
  phone: "+36 70 250 7296",
  email: null,          // pl. "hello@florea.hu"
  address: "1183 Budapest, Nefelejcs u. 95.",
  // A keresőknek (strukturált adat) – a fenti cím részei
  addressParts: { streetAddress: "Nefelejcs u. 95.", postalCode: "1183", addressLocality: "Budapest", addressRegion: "XVIII. kerület", addressCountry: "HU" },
  facebook: null,       // pl. "https://www.facebook.com/florea"
  instagram: null,      // pl. "https://www.instagram.com/florea"
  // Nyitvatartás: 0 = vasárnap … 6 = szombat, ["08:00", "18:00"] formában; null = zárva.
  // Ha az egész hours null, az oldal nem mutat nyitvatartást és élő nyitva/zárva jelzést.
  hours: {
    1: ["07:00", "18:00"],
    2: ["07:00", "18:00"],
    3: ["07:00", "18:00"],
    4: ["07:00", "18:00"],
    5: ["07:00", "18:00"],
    6: ["07:00", "18:00"],
    0: ["07:00", "18:00"],
  },
  // A nyitókép fotója (assets/photos/ mappából). Ha null, rajzolt virágkompozíció látszik.
  heroPhoto: null,      // pl. "assets/photos/nyitokep.jpg"
};

// Fotógaléria – a képeket a public/assets/photos/ mappába tedd.
// Amíg üres, a galériában rajzolt virágok látszanak.
// wide: true → a kép két oszlop széles (fekvő képekhez)
const GALLERY = [
  // { src: "assets/photos/csokor-1.jpg", alt: "Pasztell rózsacsokor eukaliptusszal" },
  // { src: "assets/photos/bolt.jpg", alt: "A Florea virágüzlet kirakata", wide: true },
];

const DAY_NAMES = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];

// A Kollekció kártyái. bloom: peony | rose | anemone | bud | leaf; palette: lásd PALETTES
// photo: ha megadod (pl. "assets/photos/rozsa.jpg"), a rajz helyett a fotó jelenik meg.
const PRODUCTS = [
  { cat: "csokor",  bloom: "peony",   palette: "blush",  seed: 2,  title: "Kerti csokor",         desc: "Laza, természetes kötés szezonális virágokból és friss zöldekből." },
  { cat: "csokor",  bloom: "rose",    palette: "wine",   seed: 8,  title: "Rózsacsokor",          desc: "Klasszikus, elegáns rózsacsokor – egy szálból vagy akár ötvenből." },
  { cat: "csokor",  bloom: "anemone", palette: "powder", seed: 5,  title: "Pasztell álom",        desc: "Lágy, púderes árnyalatok romantikus pillanatokra." },
  { cat: "csokor",  bloom: "peony",   palette: "cream",  seed: 13, title: "Florea válogatás",     desc: "A kötő szabad keze: a nap legszebb virágaiból, minden darab egyedi." },
  { cat: "szalas",  bloom: "rose",    palette: "blush",  seed: 3,  title: "Rózsa",                desc: "Klasszikus és különleges színekben, szálanként is." },
  { cat: "szalas",  bloom: "bud",     palette: "apricot",seed: 6,  title: "Tulipán",              desc: "Szezonban, sokféle színben – a tavasz legvidámabb virága." },
  { cat: "szalas",  bloom: "anemone", palette: "ivory",  seed: 9,  title: "Liliom",               desc: "Illatos, nagy virágú liliom – önmagában is látványos." },
  { cat: "noveny",  bloom: "anemone", palette: "lilac",  seed: 4,  title: "Orchidea",             desc: "Lepkeorchidea kaspóban – tartós, elegáns ajándék." },
  { cat: "noveny",  bloom: "leaf",    palette: "sage",   seed: 12, title: "Zöldnövények",         desc: "Könnyen gondozható szobanövények otthonra és irodába." },
  { cat: "alkalmi", bloom: "peony",   palette: "wine",   seed: 7,  title: "Virágdoboz",           desc: "Díszdobozba rendezett virágok – a legelegánsabb ajándék." },
  { cat: "alkalmi", bloom: "rose",    palette: "cream",  seed: 10, title: "Menyasszonyi csokor",  desc: "Az esküvő stílusához tervezve, személyes egyeztetés alapján." },
  { cat: "alkalmi", bloom: "anemone", palette: "ivory",  seed: 17, title: "Koszorú és sírcsokor", desc: "Méltó, visszafogott kegyeleti kötészet élő virágból." },
];

const CATEGORY_LABEL = { csokor: "Csokor", szalas: "Szálas virág", noveny: "Cserepes", alkalmi: "Alkalmi" };
const CARD_TINTS = ["#ece3d8", "#efe2db", "#e6e4da", "#efe6dc"];

/* ---------- Segédfüggvények ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nbsp = (s) => s.replace(/ /g, " "); // nem törhető szóköz: a telefonszám nem esik két sorba

// A házszám ne kerüljön új sorba az utcanévtől ("u. 95.")
const addrText = () => esc(SHOP.address).replace(/ (?=\d)/g, "\u00a0");
const telHref = () => "tel:" + SHOP.phone.replace(/[^\d+]/g, "");
const mapsHref = () => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(SHOP.address);
const mapEmbed = () => "https://www.google.com/maps?q=" + encodeURIComponent(SHOP.address) + "&output=embed";

/* ---------- Ikonok ---------- */
const ICON = {
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  fb: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/>',
  ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chat: '<path d="M4 5h16v11H8l-4 4z"/>',
};
const icon = (n) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[n]}</svg>`;

/* ==========================================================
   Festményszerű virágok – kódból generált SVG
   ========================================================== */
const PALETTES = {
  //        legvilágosabb → legsötétebb, közép
  blush:   { c: ["#fbefea", "#f0d0c6", "#d9a094", "#a35f58"], mid: "#5e2a27" },
  wine:    { c: ["#efc3c0", "#c47379", "#8e3445", "#561526"], mid: "#2a0910" },
  powder:  { c: ["#fbf1ee", "#f1dcd8", "#ddb7b4", "#a9817f"], mid: "#57393a" },
  cream:   { c: ["#fffaf2", "#f2e6cf", "#dac39c", "#a5875a"], mid: "#655032" },
  apricot: { c: ["#fdece0", "#f5ccac", "#e3a17d", "#b0674d"], mid: "#5a2819" },
  ivory:   { c: ["#fdfbf7", "#efe9df", "#d4cbbc", "#9e9586"], mid: "#2b2a25" },
  lilac:   { c: ["#f5eef5", "#e2d0e3", "#bc9fc3", "#7a5c8a"], mid: "#3b2547" },
  sage:    { c: ["#d6dccf", "#a9b5a0", "#76876f", "#465541"], mid: "#2c3729" },
};

function rng(seed) {
  let a = seed * 9301 + 49297;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Felfelé mutató szirom, enyhén bemetszett heggyel
function petalPath(L, W) {
  const f = (n) => n.toFixed(1);
  return `M0 0 C${f(W)} ${f(-.25 * L)} ${f(1.05 * W)} ${f(-.85 * L)} ${f(.45 * W)} ${f(-L)} Q0 ${f(-.9 * L)} ${f(-.45 * W)} ${f(-L)} C${f(-1.05 * W)} ${f(-.85 * L)} ${f(-W)} ${f(-.25 * L)} 0 0Z`;
}
function leafPath(L, W) {
  const f = (n) => n.toFixed(1);
  return `M0 0 C${f(W)} ${f(-.3 * L)} ${f(W * .6)} ${f(-.8 * L)} 0 ${f(-L)} C${f(-W * .6)} ${f(-.8 * L)} ${f(-W)} ${f(-.3 * L)} 0 0Z`;
}

let bloomUid = 0;
function makeBloom(type = "peony", paletteName = "blush", seed = 1) {
  const P = PALETTES[paletteName] || PALETTES.blush;
  const r = rng(seed);
  const id = "b" + (++bloomUid);
  const [c0, c1, c2, c3] = P.c;
  const defs = [];
  const body = [];

  const grad = (gid, stops, radius) => {
    defs.push(`<radialGradient id="${id}${gid}" cx="0" cy="0" r="${radius}" gradientUnits="userSpaceOnUse">${
      stops.map(([o, c, op = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op}"/>`).join("")}</radialGradient>`);
    return `url(#${id}${gid})`;
  };

  const ring = (n, L, W, fill, opts = {}) => {
    const off = r() * 360;
    for (let i = 0; i < n; i++) {
      const a = off + (i * 360) / n + (r() - .5) * (opts.jitter ?? 14);
      const s = .9 + r() * .18;
      body.push(`<g transform="rotate(${a.toFixed(1)}) scale(${s.toFixed(2)})"><path d="${petalPath(L, W)}" fill="${fill}" stroke="${c3}" stroke-opacity=".2" stroke-width=".5"/><path d="M0 -4 L0 ${(-L * .62).toFixed(1)}" stroke="${c3}" stroke-opacity=".1" stroke-width=".6"/></g>`);
    }
  };

  if (type === "peony") {
    const rings = [[9, 94, 36], [8, 80, 33], [8, 65, 29], [7, 50, 24], [7, 36, 19], [6, 24, 14], [5, 14, 9]];
    rings.forEach(([n, L, W], k) => {
      const t = k / (rings.length - 1);
      ring(n, L, W, grad("p" + k, [[0, t > .6 ? P.mid : c3], [.45, t > .4 ? c3 : c2], [1, t > .5 ? c1 : c0]], L));
    });
  } else if (type === "rose") {
    const g = grad("r", [[0, P.mid], [.35, c3], [.75, c2], [1, c1]], 96);
    const g2 = grad("r2", [[0, c3], [.6, c1], [1, c0]], 96);
    const n = 26;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const L = 94 * Math.pow(1 - t, .75) + 6;
      const a = i * 137.5 + (r() - .5) * 10;
      body.push(`<g transform="rotate(${a.toFixed(1)})"><path d="${petalPath(L, L * .62)}" fill="${i < 8 ? g2 : g}" stroke="${c3}" stroke-opacity=".26" stroke-width=".5"/></g>`);
    }
  } else if (type === "anemone") {
    const g = grad("a", [[0, c3], [.3, c2], [.7, c1], [1, c0]], 96);
    const n = 6 + Math.floor(r() * 2);
    ring(n, 94, 58, g, { jitter: 10 });
    ring(n, 70, 44, grad("a2", [[0, c3], [.5, c1], [1, c0, .85]], 72), { jitter: 18 });
    body.push(`<circle r="19" fill="${P.mid}"/>`);
    for (let i = 0; i < 34; i++) {
      const a = r() * Math.PI * 2, d = 19 + r() * 10;
      body.push(`<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="${(1 + r() * 1.6).toFixed(1)}" fill="${P.mid}" opacity="${(.5 + r() * .5).toFixed(2)}"/>`);
    }
    body.push(`<circle r="7" fill="${c3}" opacity=".6"/>`);
  } else if (type === "bud") {
    const g = grad("u", [[0, P.mid], [.5, c3], [1, c1]], 80);
    [-24, 22, -8, 10, 0].forEach((a) => body.push(`<g transform="translate(0 50) rotate(${a + (r() - .5) * 6})"><path d="${petalPath(88, 26)}" fill="${g}" stroke="${c3}" stroke-opacity=".25" stroke-width=".5"/></g>`));
    const s = PALETTES.sage.c;
    [-50, 50].forEach((a) => body.push(`<g transform="translate(0 52) rotate(${a})"><path d="${leafPath(42, 12)}" fill="${s[2]}"/></g>`));
  } else if (type === "leaf") {
    const s = PALETTES.sage.c;
    defs.push(`<linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="-1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="${s[3]}"/><stop offset="1" stop-color="${s[1]}"/></linearGradient>`);
    body.push(`<path d="M-10 96 C0 40 10 -20 40 -90" fill="none" stroke="${s[3]}" stroke-width="1.6"/>`);
    for (let i = 0; i < 7; i++) {
      const t = i / 7;
      const x = -10 + 50 * Math.pow(t, 1.3), y = 96 - 186 * t;
      const side = i % 2 ? 1 : -1;
      const L = 58 - t * 28;
      body.push(`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${side * (55 + r() * 15)})"><path d="${leafPath(L, L * .34)}" fill="url(#${id}l)" opacity="${(.85 + r() * .15).toFixed(2)}"/></g>`);
    }
  }

  const soft = type === "leaf" ? "" : ` filter="url(#${id}f)"`;
  defs.push(`<filter id="${id}f" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="5"/><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#2b2219" flood-opacity=".18"/></filter>`);
  const fit = type === "bud" ? ` transform="scale(1.45) translate(0 -6)"` : "";
  return `<svg viewBox="-110 -110 220 220" aria-hidden="true" focusable="false"><defs>${defs.join("")}</defs><g${fit}><g${soft}>${body.join("")}</g></g></svg>`;
}

/* ==========================================================
   HTML-darabok – ezeket a böngésző és a tools/prerender.js is használja
   ========================================================== */

// Nyitókép: fotó, ha van; különben három virágból álló kompozíció
function heroArtHTML() {
  if (SHOP.heroPhoto) {
    return `<img src="${esc(SHOP.heroPhoto)}" alt="Virágcsokor a Florea virágüzletből" width="900" height="1200" fetchpriority="high">`;
  }
  return `
    <div class="hero__bloom hero__bloom--a">${makeBloom("peony", "blush", 21)}</div>
    <div class="hero__bloom hero__bloom--b">${makeBloom("rose", "wine", 14)}</div>
    <div class="hero__bloom hero__bloom--c">${makeBloom("anemone", "cream", 5)}</div>
    <div class="hero__bloom hero__bloom--d">${makeBloom("leaf", "sage", 3)}</div>`;
}

// Elsődleges gombok: telefon → Facebook → e-mail, amelyik elérhető
function primaryContact() {
  if (SHOP.phone) return { href: telHref(), label: "Hívás", icon: "phone" };
  if (SHOP.facebook) return { href: SHOP.facebook, label: "Üzenet", icon: "chat", ext: true };
  if (SHOP.email) return { href: "mailto:" + SHOP.email, label: "E-mail", icon: "mail" };
  return null;
}
const extAttr = (c) => (c.ext ? ' target="_blank" rel="noopener"' : "");

function heroCtaHTML() {
  const c = primaryContact();
  const main = c
    ? `<a class="btn btn--solid" href="${esc(c.href)}"${extAttr(c)}>${icon(c.icon)}<span>${c.label === "Hívás" ? "Hívjon minket" : c.label === "Üzenet" ? "Írjon nekünk" : "Írjon e-mailt"}</span></a>`
    : `<a class="btn btn--solid" href="#kollekcio"><span>A kollekció</span>${icon("arrow")}</a>`;
  const second = c
    ? `<a class="btn btn--ghost" href="#kollekcio"><span>A kollekció</span>${icon("arrow")}</a>`
    : `<a class="btn btn--ghost" href="#alkalmak"><span>Alkalmak</span>${icon("arrow")}</a>`;
  return main + second;
}

function navCtaHTML() {
  const c = primaryContact();
  return c ? `<a class="nav__cta" href="${esc(c.href)}"${extAttr(c)}>${icon(c.icon)}<span>${c.label}</span></a>` : "";
}

function actionbarHTML() {
  const c = primaryContact();
  const items = [];
  if (c) items.push(`<a class="actionbar__btn actionbar__btn--main" href="${esc(c.href)}"${extAttr(c)}>${icon(c.icon)}<span>${c.label}</span></a>`);
  if (SHOP.address) items.push(`<a class="actionbar__btn" href="${esc(mapsHref())}" target="_blank" rel="noopener">${icon("pin")}<span>Útvonal</span></a>`);
  else items.push(`<a class="actionbar__btn" href="#kollekcio">${icon("arrow")}<span>Kollekció</span></a>`);
  return items.join("");
}

function hoursHTML(today = -1) {
  if (!SHOP.hours) return "";
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = SHOP.hours[d];
    return `<li${d === today ? ' class="is-today"' : ""}><span>${DAY_NAMES[d]}</span><span>${h ? `${h[0]} – ${h[1]}` : "Zárva"}</span></li>`;
  }).join("");
}

function contactHTML() {
  const rows = [];
  if (SHOP.phone) rows.push(`
      <a class="crow" href="${telHref()}">
        <span class="crow__ico">${icon("phone")}</span>
        <span class="crow__body"><span class="crow__label">Telefon</span><span class="crow__value">${nbsp(esc(SHOP.phone))}</span></span>
        <span class="crow__go">${icon("arrow")}</span>
      </a>`);
  if (SHOP.address) rows.push(`
      <a class="crow" href="${esc(mapsHref())}" target="_blank" rel="noopener">
        <span class="crow__ico">${icon("pin")}</span>
        <span class="crow__body"><span class="crow__label">Cím · útvonaltervezés</span><span class="crow__value">${addrText()}</span></span>
        <span class="crow__go">${icon("arrow")}</span>
      </a>`);
  if (SHOP.email) rows.push(`
      <a class="crow" href="mailto:${esc(SHOP.email)}">
        <span class="crow__ico">${icon("mail")}</span>
        <span class="crow__body"><span class="crow__label">E-mail</span><span class="crow__value">${esc(SHOP.email)}</span></span>
        <span class="crow__go">${icon("arrow")}</span>
      </a>`);
  if (SHOP.facebook) rows.push(`
      <a class="crow" href="${esc(SHOP.facebook)}" target="_blank" rel="noopener">
        <span class="crow__ico">${icon("fb")}</span>
        <span class="crow__body"><span class="crow__label">Facebook</span><span class="crow__value">Kövessen és írjon nekünk</span></span>
        <span class="crow__go">${icon("arrow")}</span>
      </a>`);
  if (SHOP.instagram) rows.push(`
      <a class="crow" href="${esc(SHOP.instagram)}" target="_blank" rel="noopener">
        <span class="crow__ico">${icon("ig")}</span>
        <span class="crow__body"><span class="crow__label">Instagram</span><span class="crow__value">Friss csokrok, nap mint nap</span></span>
        <span class="crow__go">${icon("arrow")}</span>
      </a>`);
  if (!rows.length) rows.push(`
      <div class="crow crow--static">
        <span class="crow__ico">${icon("chat")}</span>
        <span class="crow__body"><span class="crow__label">Elérhetőség</span><span class="crow__value">Elérhetőségeink hamarosan itt olvashatók.</span></span>
      </div>`);
  return rows.join("");
}

function hoursBlockHTML(today = -1) {
  if (!SHOP.hours) return "";
  return `
      <div class="hours">
        <div class="hours__head">${icon("clock")}<h3>Nyitvatartás</h3><span class="status status--sm" data-status hidden><i class="status__dot"></i><span class="status__text"></span></span></div>
        <ul class="hours__list">${hoursHTML(today)}</ul>
      </div>`;
}

function mapHTML() {
  if (!SHOP.address) return "";
  return `
      <div class="mapbox">
        <button class="mapbox__load" type="button" data-map-src="${esc(mapEmbed())}">
          ${icon("pin")}<span>Térkép betöltése</span><small>A Google Térkép csak kattintásra töltődik be.</small>
        </button>
      </div>`;
}

function footerContactHTML() {
  const parts = [];
  if (SHOP.address) parts.push(`<span>${addrText()}</span>`);
  if (SHOP.phone) parts.push(`<a href="${telHref()}">${nbsp(esc(SHOP.phone))}</a>`);
  if (SHOP.email) parts.push(`<a href="mailto:${esc(SHOP.email)}">${esc(SHOP.email)}</a>`);
  if (SHOP.facebook) parts.push(`<a href="${esc(SHOP.facebook)}" target="_blank" rel="noopener">Facebook</a>`);
  if (SHOP.instagram) parts.push(`<a href="${esc(SHOP.instagram)}" target="_blank" rel="noopener">Instagram</a>`);
  return parts.join("");
}

function productsHTML(filter = "all") {
  return PRODUCTS
    .filter((p) => filter === "all" || p.cat === filter)
    .map((p, i) => {
      const bg = CARD_TINTS[i % CARD_TINTS.length];
      const art = p.photo
        ? `<img src="${esc(p.photo)}" alt="${esc(p.title)}" loading="lazy" decoding="async">`
        : `<div class="bloom-wrap">${makeBloom(p.bloom, p.palette, p.seed)}</div>`;
      return `
      <article class="card" style="--d:${i * 60}ms">
        <div class="card__art${p.photo ? " card__art--photo" : ""}" style="--tint:${bg}">
          <span class="card__cat">${CATEGORY_LABEL[p.cat]}</span>
          ${art}
        </div>
        <div class="card__body">
          <span class="card__idx">${String(i + 1).padStart(2, "0")}</span>
          <h3 class="card__title">${esc(p.title)}</h3>
          <p class="card__desc">${esc(p.desc)}</p>
        </div>
      </article>`;
    }).join("");
}

// Galéria: fotók, vagy amíg nincsenek, rajzolt virágtáblák
const GALLERY_ART = [
  ["peony", "powder", 31], ["rose", "wine", 32], ["leaf", "sage", 33], ["anemone", "cream", 34],
  ["peony", "apricot", 35], ["rose", "blush", 36], ["bud", "lilac", 37], ["anemone", "ivory", 38],
];
function galleryHTML() {
  if (GALLERY.length) {
    return GALLERY.map((g, i) => `
      <button class="tile${g.wide ? " tile--wide" : ""}" type="button" data-index="${i}" aria-label="Kép nagyítása: ${esc(g.alt)}">
        <img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" decoding="async">
      </button>`).join("");
  }
  return GALLERY_ART.map(([t, p, s], i) => `
      <div class="tile tile--art${[0, 3, 4, 7].includes(i) ? " tile--wide" : ""}" style="--tint:${CARD_TINTS[i % CARD_TINTS.length]}">
        <div class="bloom-wrap">${makeBloom(t, p, s)}</div>
      </div>`).join("");
}

// A keresőknek: strukturált adat, csak a valóban megadott mezőkkel
function jsonLd() {
  const d = {
    "@context": "https://schema.org",
    "@type": "Florist",
    name: SHOP.name,
    description: "Virágüzlet és virágkötészet: kézzel kötött csokrok, szálas virágok, cserepes növények, esküvői és kegyeleti kötészet.",
  };
  if (SHOP.phone) d.telephone = SHOP.phone;
  if (SHOP.email) d.email = SHOP.email;
  if (SHOP.address) d.address = SHOP.addressParts ? { "@type": "PostalAddress", ...SHOP.addressParts } : SHOP.address;
  const same = [SHOP.facebook, SHOP.instagram].filter(Boolean);
  if (same.length) d.sameAs = same;
  if (SHOP.hours) {
    const en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    d.openingHoursSpecification = Object.entries(SHOP.hours).filter(([, h]) => h)
      .map(([day, h]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: en[day], opens: h[0], closes: h[1] }));
  }
  return JSON.stringify(d, null, 2).replace(/</g, "\\u003c");
}

// A data-fill="név" tárolók tartalma
const FILLS = {
  heroArt: heroArtHTML,
  heroCta: heroCtaHTML,
  navCta: navCtaHTML,
  actionbar: actionbarHTML,
  contact: contactHTML,
  hoursBlock: hoursBlockHTML,
  map: mapHTML,
  footerContact: footerContactHTML,
  products: productsHTML,
  gallery: galleryHTML,
};

/* ==========================================================
   Böngészőben futó részek
   ========================================================== */

// Aktuális idő budapesti időzónában, a látogató helyétől függetlenül
function budapestNow() {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Budapest", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const minutes = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
    if (day < 0 || Number.isNaN(minutes)) throw new Error("hiányos időzóna-adat");
    return { day, minutes };
  } catch (err) {
    // Tartalék: CET, nyári időszámítás március utolsó vasárnapjától október utolsó vasárnapjáig
    const now = new Date();
    const y = now.getUTCFullYear();
    const lastSunday = (month) => { const d = new Date(Date.UTC(y, month + 1, 0, 1)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d; };
    const summer = now >= lastSunday(2) && now < lastSunday(9);
    const t = new Date(now.getTime() + (summer ? 2 : 1) * 3600e3);
    return { day: t.getUTCDay(), minutes: t.getUTCHours() * 60 + t.getUTCMinutes() };
  }
}

function openStatus() {
  const { day, minutes } = budapestNow();
  const today = SHOP.hours[day];
  if (today && minutes >= toMinutes(today[0]) && minutes < toMinutes(today[1])) {
    return { open: true, text: `Most nyitva · ma ${today[1]}-ig` };
  }
  if (today && minutes < toMinutes(today[0])) {
    return { open: false, text: `Most zárva · ma ${today[0]}-kor nyitunk` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (SHOP.hours[d]) {
      const when = i === 1 ? "holnap" : DAY_NAMES[d].toLowerCase();
      return { open: false, text: `Most zárva · ${when} ${SHOP.hours[d][0]}-kor nyitunk` };
    }
  }
  return { open: false, text: "Most zárva" };
}

function updateStatus() {
  if (!SHOP.hours) return;
  const list = $(".hours__list");
  if (list) list.innerHTML = hoursHTML(budapestNow().day);
  const s = openStatus();
  $$("[data-status]").forEach((el) => {
    el.hidden = false;
    el.classList.toggle("is-open", s.open);
    $(".status__text", el).textContent = s.text;
  });
}

function fillAll() {
  $$("[data-fill]").forEach((el) => {
    const f = FILLS[el.dataset.fill];
    if (!f) return;
    const html = f().trim();
    el.innerHTML = html;
    // Üres tárolók (pl. hiányzó térkép) ne foglaljanak helyet
    if (el.hasAttribute("data-fill-hide")) el.hidden = !html;
  });
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
}

/* ---------- Kollekció: szűrők és lapozás ---------- */
function initCollection() {
  const rail = $("#products");
  $$(".tabs button").forEach((b) => b.addEventListener("click", () => {
    $$(".tabs button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    rail.innerHTML = productsHTML(b.dataset.filter);
    rail.scrollLeft = 0;
    updateRailButtons();
  }));

  const step = () => {
    const card = $(".card", rail);
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    return card ? card.getBoundingClientRect().width + gap : 300;
  };
  const prev = $("[data-rail='-1']"), next = $("[data-rail='1']");
  function updateRailButtons() {
    const max = rail.scrollWidth - rail.clientWidth - 2;
    if (prev) prev.disabled = rail.scrollLeft <= 2;
    if (next) next.disabled = rail.scrollLeft >= max;
  }
  $$("[data-rail]").forEach((b) => b.addEventListener("click", () => {
    rail.scrollBy({ left: step() * Number(b.dataset.rail), behavior: reduceMotion ? "auto" : "smooth" });
  }));
  rail.addEventListener("scroll", updateRailButtons, { passive: true });
  window.addEventListener("resize", updateRailButtons);
  updateRailButtons();
}

/* ---------- Galéria: nagyítás ---------- */
function initLightbox() {
  const dlg = $("#lightbox");
  if (!dlg || !GALLERY.length || typeof dlg.showModal !== "function") return;
  const img = $("img", dlg), cap = $("figcaption", dlg);
  let idx = 0;
  const show = (i) => {
    idx = (i + GALLERY.length) % GALLERY.length;
    img.src = GALLERY[idx].src; img.alt = GALLERY[idx].alt; cap.textContent = GALLERY[idx].alt;
  };
  $("#gallery").addEventListener("click", (e) => {
    const t = e.target.closest(".tile[data-index]");
    if (!t) return;
    show(Number(t.dataset.index));
    dlg.showModal();
  });
  $("[data-lb='close']", dlg).addEventListener("click", () => dlg.close());
  $("[data-lb='prev']", dlg).addEventListener("click", () => show(idx - 1));
  $("[data-lb='next']", dlg).addEventListener("click", () => show(idx + 1));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  // Húzás telefonon
  let x0 = null;
  dlg.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

/* ---------- Térkép: csak kattintásra tölti be a Google Maps-et ---------- */
function initMap() {
  $$(".mapbox__load").forEach((btn) => btn.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.title = "A Florea virágüzlet helye a térképen";
    f.src = btn.dataset.mapSrc;
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer-when-downgrade";
    btn.replaceWith(f);
  }));
}

/* ---------- Fejléc és menü ---------- */
function initNav() {
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  const menu = $("#menu");
  const bar = $(".actionbar");
  const hero = $(".hero");

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    if (bar) bar.classList.toggle("is-on", y > hero.offsetHeight * .6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü bezárása" : "Menü megnyitása");
    document.documentElement.classList.toggle("menu-open", open);
    if (open) $("a", menu).focus({ preventScroll: true });
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); } });
  window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });
}

/* ---------- Megjelenés görgetéskor ---------- */
function initReveal() {
  const els = $$("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
  els.forEach((el) => io.observe(el));
}

/* ---------- Képek: ha egy fotó nem tölthető be, eltűnik ---------- */
function initImageFallbacks() {
  $$("img:not(.lightbox img)").forEach((img) => {
    const fail = () => {
      const tile = img.closest(".tile");
      if (tile) tile.remove();
      else if (img.closest(".hero__art")) { SHOP.heroPhoto = null; img.closest(".hero__art").innerHTML = heroArtHTML(); }
      else img.remove();
    };
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
    else img.addEventListener("error", fail, { once: true });
  });
}

if (!window.__PRERENDER__) {
  document.documentElement.classList.replace("no-js", "js");
  const start = () => {
    fillAll();
    updateStatus();
    setInterval(updateStatus, 60e3);
    initNav();
    initCollection();
    initLightbox();
    initMap();
    initReveal();
    initImageFallbacks();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
