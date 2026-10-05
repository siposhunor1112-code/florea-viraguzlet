/* ==========================================================
   Előre beírja az index.html-be a kollekciót, a galériát,
   az elérhetőségeket és a virágrajzokat, hogy JavaScript nélkül
   (pl. telefonos fájlelőnézetben, keresőknél, Facebook-megosztásnál)
   is látszódjanak. A böngészőben a script.js ezeket frissen újrarajzolja.

   Futtatás az adatok (public/script.js) módosítása után:  node tools/prerender.js
   ========================================================== */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const root = path.join(__dirname, "..", "public");
const htmlPath = path.join(root, "index.html");
const src = fs.readFileSync(path.join(root, "script.js"), "utf8");

const sandbox = { console, window: { __PRERENDER__: true, matchMedia: () => ({ matches: false }) } };
vm.createContext(sandbox);
vm.runInContext(src + "\n;globalThis.__api = { FILLS, jsonLd };", sandbox);
const { FILLS, jsonLd } = sandbox.__api;

let html = fs.readFileSync(htmlPath, "utf8");

// <… data-fill="név"><!--fill-->…<!--/fill--></…> tárolók feltöltése
const re = /(<(\w+)\b([^>]*)\bdata-fill="(\w+)"([^>]*)>)<!--fill-->[\s\S]*?<!--\/fill-->/g;
let count = 0;
html = html.replace(re, (m, open, tag, pre, name, post) => {
  const f = FILLS[name];
  if (!f) throw new Error("Ismeretlen data-fill: " + name);
  const inner = f().trim();
  count++;
  // data-fill-hide: üresen ne foglaljon helyet
  if (/\bdata-fill-hide\b/.test(open)) {
    open = open.replace(/\shidden(?=[\s>])/, "");
    if (!inner) open = open.replace(/>$/, " hidden>");
  }
  return `${open}<!--fill-->${inner}<!--/fill-->`;
});
if (!count) throw new Error("Nem található data-fill tároló");

// Strukturált adat a keresőknek
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${jsonLd()}\n  </script>`);

// Évszám
html = html.replace(/(<span data-year>)[^<]*(<\/span>)/g, `$1${new Date().getFullYear()}$2`);

// Verziószám a CSS/JS hivatkozásokban: ha a fájl változik, a böngésző biztosan az újat tölti le
for (const file of ["styles.css", "script.js"]) {
  const v = crypto.createHash("sha1").update(fs.readFileSync(path.join(root, file))).digest("hex").slice(0, 8);
  html = html.replace(new RegExp(`(["'])${file.replace(".", "\\.")}(\\?v=[^"']*)?\\1`, "g"), `$1${file}?v=${v}$1`);
}

fs.writeFileSync(htmlPath, html);
console.log(`Kész: ${count} tároló feltöltve → public/index.html`);
