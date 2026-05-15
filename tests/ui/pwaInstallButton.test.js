const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("PWA install button renders an iOS home screen fallback hint", () => {
  const button = read("src/components/PwaInstallButton.jsx");
  const globals = read("src/app/globals.css");

  assert.match(button, /installHintVisible/);
  assert.match(button, /Jaga - Lisa avalehele/);
  assert.match(button, /Share - Add to Home Screen/);
  assert.doesNotMatch(button, /iosInstallFallback/);
  assert.doesNotMatch(button, /isIosInstallFallback/);
  assert.match(button, /className="pwa-install__hint"/);
  assert.match(button, /aria-live="polite"/);
  assert.match(globals, /\.pwa-install__hint\s*{/);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*border:\s*none;/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*background:\s*rgba\(255,\s*252,\s*246,\s*0\.9\);/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*backdrop-filter:\s*blur\(5px\) saturate\(1\.08\);/s);
  assert.match(globals, /\.pwa-install__hint::before\s*{[^}]*border:\s*none;/s);
  assert.match(globals, /\.site-nav:has\(\.pwa-install__hint\)\s*{[^}]*overflow:\s*visible;/s);
  assert.match(globals, /html\[data-theme="dark"\] \.pwa-install__hint\s*{[^}]*background:\s*rgba\(18,\s*18,\s*20,\s*0\.9\);/s);
});

test("PWA install icons use the black icon cache version", () => {
  const manifest = read("src/app/manifest.js");
  const layout = read("src/app/layout.js");
  const serviceWorker = read("public/sw.js");

  assert.match(manifest, /black-v2/);
  assert.match(layout, /\/favicon\.svg\?v=black-v2/);
  assert.match(serviceWorker, /beyondframes-v4/);
  assert.match(serviceWorker, /\/icon-512\.png\?v=black-v2/);
});
