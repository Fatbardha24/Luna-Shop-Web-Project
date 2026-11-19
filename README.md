# LUNA STORE

Projekt për lëndën **Zhvillim Web** — një dyqan online i thjeshtë me HTML, CSS dhe JavaScript, pa framework.

Faqja ka një katalog me 9 produkte, kërkim dhe filtra, shportë që ruhet në browser dhe një formë porosie me validim. Nuk ka backend: të dhënat ruhen në `localStorage`, prandaj shporta dhe historia e porosive mbeten edhe pas rifreskimit të faqes.

## Struktura

```
luna-store/
├── index.html      → faqja (header, hero, shop, reviews, about, shporta, porositë)
├── style.css       → të gjitha stilet, me media queries për telefon
├── main.js         → produktet, filtrat, shporta, validimi, porositë
└── assets/         → fotot e produkteve (Unsplash)
```

## Si hapet

Mjafton të hapet `index.html` në browser. Për ta parë si server lokal (rekomandohet, që të funksionojnë të gjitha rrugët e fotove):

```bash
python -m http.server 5500
```

Pastaj hapet `http://localhost:5500`.

## Çfarë bën

- **Katalog** — 9 produkte në tri kategori (Fashion, Beauty, Technology).
- **Kërkim dhe filtra** — kërkim live sipas emrit, filtra me kategori dhe renditje sipas çmimit ose emrit.
- **Shportë** — shtim, ndryshim sasie, fshirje; dërgesa €3 dhe falas mbi €50.
- **Porosi** — formë me validim në faqe (jo `alert`), porosia ruhet dhe shfaqet te *Order history*.
- **Ruajtje lokale** — `luna-cart` dhe `luna-orders` në `localStorage`.
- **Responsive** — 1024px, 900px, 760px dhe 620px.

## Shënime

- Pagesa është vetëm demo; asnjë transaksion nuk kryhet.
- Fotot janë marrë nga [Unsplash](https://unsplash.com) dhe përdoren vetëm për qëllime shkollore.
- Vlerësimet te seksioni *Reviews* janë përmbajtje demo, jo vlerësime reale klientësh.
