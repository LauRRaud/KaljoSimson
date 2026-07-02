#!/usr/bin/env bash
# Serveripoolne deploy — käivitatakse üle SSH kaustast /var/www/beyondframes.
# npm ci jookseb AINULT siis, kui sõltuvused (package.json / package-lock.json)
# muutusid; muidu jäetakse vahele. Kui build ebaõnnestub, pm2 EI taaskäivitu.
set -euo pipefail

cd /var/www/beyondframes

# npm/prisma jätab vahel lockfaili "triivima" — viskame serveripoolse muudatuse
# minema, et git pull ei takerduks (õige versioon tuleb gitist).
git checkout -- package-lock.json 2>/dev/null || true

BEFORE="$(git rev-parse HEAD)"
git pull --ff-only
AFTER="$(git rev-parse HEAD)"

if git diff --name-only "$BEFORE" "$AFTER" | grep -qE '^package(-lock)?\.json$'; then
  echo "→ sõltuvused muutusid → npm ci"
  npm ci
else
  echo "→ sõltuvused samad → jätan npm ci vahele"
fi

echo "→ build"
npm run build

echo "→ pm2 restart"
pm2 restart beyondframes

echo "✓ deploy valmis"
