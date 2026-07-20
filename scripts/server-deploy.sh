#!/usr/bin/env bash
# Serveripoolne deploy — käivitatakse üle SSH kaustast /var/www/kaljosimson.
# npm ci jookseb AINULT siis, kui sõltuvused (package.json / package-lock.json)
# muutusid; muidu jäetakse vahele. Kui build ebaõnnestub, pm2 EI taaskäivitu.
set -euo pipefail

cd /var/www/kaljosimson

BEFORE="$(git rev-parse HEAD)"
git pull --ff-only
AFTER="$(git rev-parse HEAD)"

if git diff --name-only "$BEFORE" "$AFTER" | grep -qE '^package(-lock)?\.json$'; then
  echo "→ sõltuvused muutusid → npm ci"
  npm ci
fi

npm run build
pm2 restart kaljosimson --update-env
echo "→ valmis: $(git rev-parse --short HEAD)"
