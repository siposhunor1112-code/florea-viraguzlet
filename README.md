# Florea Virágüzlet – weboldal

Statikus, egyoldalas weboldal a Florea Virágüzletnek: telefonra tervezve, onnan bővítve nagyobb kijelzőkre.
Nincs szükség build lépésre: a `public/` mappa bármilyen statikus tárhelyen kiszolgálható
(Cloudflare Workers, Netlify, GitHub Pages).

## Fájlok

- `public/` – maga a weboldal (ez kerül ki a netre):
  - `index.html` – az oldal szerkezete és szövegei
  - `styles.css` – megjelenés (színek és betűk a `:root` változókban)
  - `script.js` – **minden adat itt van**: elérhetőségek, nyitvatartás, kollekció, galéria
  - `assets/photos/` – ide kerülnek a fotók
  - `assets/fonts/` – betűtípusok saját tárhelyről (SIL Open Font License)
  - `assets/logo.svg` – a logó vektorosan (átlátszó háttér); `assets/logo.png` – ugyanez 1024 px-es PNG-ben
  - `assets/favicon.svg`, `assets/apple-touch-icon.png` – böngészőfül- és telefonos ikon a logóból
  - `assets/og.jpg` – megosztási kép (Facebook, Messenger, Viber előnézet)
  - `robots.txt`, `_headers` – keresők és biztonsági fejlécek (a Cloudflare alkalmazza)
- `wrangler.jsonc` – Cloudflare-beállítás (a `public/` mappát teszi ki)
- `tools/prerender.js` – beírja az adatokat a `public/index.html`-be (lásd lent)

## Megjelenés

- Betűtípusok: Cormorant Garamond (címek) és Manrope (szöveg)
- Színek: a logó bordója (`#802b48`), mély bor a sötét részeken, elefántcsont háttér – a `public/styles.css` elején
- Amíg nincs fotó, a virágképek kódból készülnek (`makeBloom` a `public/script.js`-ben)

## Szekciók

Nyitókép (élő nyitva/zárva jelzéssel, ha van nyitvatartás) · 01 A bolt · 02 Kollekció (szűrhető, oldalra lapozható) ·
03 Alkalmak · 04 Galéria (nagyítható fotók, telefonon húzással lapozható) · 05 Rendelés · 06 Kapcsolat (hívás,
útvonal, e-mail, Facebook, Instagram, nyitvatartás, térkép kattintásra). Telefonon alul mindig ott van a
**Hívás** és az **Útvonal** gomb.

## Adatok szerkesztése (`public/script.js` eleje)

- `SHOP.phone`, `SHOP.email`, `SHOP.address`, `SHOP.facebook`, `SHOP.instagram` – ha `null`, az oldal nem mutatja
- `SHOP.hours` – nyitvatartás napokra bontva (példa a fájlban); ebből számolja az oldal, hogy most nyitva van-e (budapesti idő)
- `SHOP.heroPhoto` – a nyitókép fotója; ha `null`, rajzolt virágkompozíció látszik
- `GALLERY` – a galéria fotói: `{ src: "assets/photos/kep.jpg", alt: "rövid leírás", wide: true }`
- `PRODUCTS` – a kollekció kártyái; `photo: "assets/photos/…"` megadásával a rajz helyett fotó jelenik meg (a fotós kártyák kerülnek előre)
- `VIDEOS` – videók a `public/assets/videos/` mappából; az oldal némítva, folyamatosan lejátssza őket, amikor láthatók, koppintásra szól a hang. Videó: MP4 (H.264), álló 9:16, 10–30 mp, lehetőleg 5 MB alatt

Fotók: JPG vagy WebP, a hosszabbik oldal kb. 1600 px, egyenként lehetőleg 400 KB alatt.

### Adatmódosítás után

Az adatok az `index.html`-be is be vannak írva, hogy JavaScript nélkül (keresők, megosztási előnézet) is látszódjanak:

```sh
node tools/prerender.js
```

## Élesítés előtt

- `index.html`: az `og:image` sorba a végleges domain kerüljön (teljes URL)
- a kollekció kártyái általános virágbolti kínálatot mutatnak – igazítsd a bolt tényleges kínálatához

## Helyi megtekintés

```sh
python3 -m http.server 8000 -d public
# majd: http://localhost:8000
```
