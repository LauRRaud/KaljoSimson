# Kaljo Simson — maalikunstniku visiitkaart

Ühe kunstniku veebileht: avaleht, galeriiruum ja kunstniku profiil.
Next.js (App Router), ilma andmebaasita — kogu sisu elab failis
[content/site-content.json](content/site-content.json).

## Lehed

- `/` — avaleht: hero, valik teoseid, tsitaat, kontakt
- `/galerii` — liuglev galeriiruum (kiirusevalik, raamivärvi valik, luup)
- `/kunstnik` — portree, biograafia ja teoste võrgustik lightboxiga
- Keelevahetus ET/EN käib `?lang=en` parameetriga; hele ja tume teema
  salvestuvad localStorage'i. Aktsentvärvid tulevad kunstniku maalitud
  profiiliportreest (türkiis, magenta, oranž, kollane).

## Käivitamine

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # node --test tests/
npm run build && npm start   # toodang
```

## Sisu muutmine

Kõik tekstid (ET/EN), kontaktandmed ja teoste nimekiri on failis
`content/site-content.json`. Teoste pildid elavad kaustas
`public/Profiilid/Kaljo Simson/`. Pärast sisumuudatust tee uus build.

**NB! Kohatäited, mis vajavad kliendi kinnitust:**

- `contact.email` (`info@kaljosimson.ee`) ja `contact.phone` on kohatäited
- `site.domain` ja layout.js `metadataBase` (`https://kaljosimson.ee`)
- Teoste aastad/tehnikad/mõõdud on märgitud "täpsustamisel"

## Deploy

Leht ei vaja andmebaasi ega keskkonnamuutujaid — serveris piisab:

```bash
npm ci && npm run build
npm start   # või pm2/systemd taha
```

Vana lehe (BeyondFrames) kuvatõmmised on viiteks kaustas `docs/vana-leht/`.
