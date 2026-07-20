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

Lihtsaim tee on **/admin** — parooliga kaitstud haldusvaade, kus saab muuta
kõiki tekste (ET/EN), kontaktandmeid, kunstniku profiili ja teoseid ning
laadida üles pilte. Muudatused salvestuvad faili
`content/site-content.local.json` (gitist väljas) ja jõustuvad kohe, ilma
uue build'ita. Üles laaditud pildid lähevad kausta `uploads/`.

Parool ja sessioonivõti tulevad keskkonnamuutujatest (`.env.local`
arenduses, serveris `.env`):

```
KS_ADMIN_PASSWORD=...
KS_SESSION_SECRET=...
```

Lähteseis (gitis) on failis `content/site-content.json`; algsed teoste
pildid kaustas `public/Profiilid/Kaljo Simson/`.

**NB! Kohatäited, mis vajavad kliendi kinnitust:**

- `contact.email` (`info@kaljosimson.ee`) ja `contact.phone` on kohatäited
- `site.domain` ja layout.js `metadataBase` (`https://kaljosimson.ee`)
- Teoste aastad/tehnikad/mõõdud on märgitud "täpsustamisel"

## Deploy

Leht ei vaja andmebaasi. Server: `/var/www/kaljosimson`,
pm2 protsess `kaljosimson` (localhost:3040), nginx kuulab avalikul pordil 8081.
Kuni domeeni ostuni on leht aadressil `http://217.146.72.147:8081`.

```bash
npm run deploy   # git push + serveripoolne build ja pm2 restart
```

Kui domeen on olemas: lisa nginx'i server block (port 80/443, proxy_pass
127.0.0.1:3040), certbot sertifikaadi jaoks, ja uuenda `metadataBase`
failis src/app/layout.js ning `site.domain` sisufailis.

Vana lehe (BeyondFrames) kuvatõmmised on viiteks kaustas `docs/vana-leht/`.
