# LUNA STORE

Projekt per lenden **Zhvillim Web** — nje dyqan online i thjeshte me HTML, CSS dhe JavaScript, pa framework.

Faqja ka nje katalog me 9 produkte, kerkim dhe filtra, shporte qe ruhet ne browser dhe nje forme porosie me validim. Nuk ka backend: te dhenat ruhen ne `localStorage`, prandaj shporta dhe historia e porosive mbeten edhe pas rifreskimit te faqes.

## Struktura

```text
luna-store/
├── index.html      → faqja (header, hero, shop, reviews, about, shporta, porosite)
├── style.css       → te gjitha stilet, me media queries per telefon
├── main.js         → produktet, filtrat, shporta, validimi, porosite
└── assets/         → fotot e produkteve (Unsplash)
```

## Si hapet

Mjafton te hapet `index.html` ne browser. Per ta pare si server lokal (rekomandohet, qe te funksionojne te gjitha rruget e fotove):

```bash
python -m http.server 5500
```

Pastaj hapet `http://localhost:5500`.

## Cfare ben

- **Katalog** — 9 produkte ne tri kategori (Fashion, Beauty, Technology).
- **Kerkim dhe filtra** — kerkim live sipas emrit, filtra me kategori dhe renditje sipas cmimit ose emrit.
- **Shporte** — shtim, ndryshim sasie, fshirje; dergesa €3 dhe falas mbi €50.
- **Porosi** — forme me validim ne faqe (jo `alert`), porosia ruhet dhe shfaqet te *Order history*.
- **Ruajtje lokale** — `luna-cart` dhe `luna-orders` ne `localStorage`.
- **Responsive** — 1024px, 900px, 760px dhe 620px.

## Shenime

- Pagesa eshte vetem demo; asnje transaksion nuk kryhet.
- Fotot jane marre nga [Unsplash](https://unsplash.com) dhe perdoren vetem per qellime shkollore.
- Vleresimet te seksioni *Reviews* jane permbajtje demonstrative.ajtje demo, jo vlerësime reale klientësh.
