const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("PWA install button does not render an inline fallback hint", () => {
  const button = read("src/components/PwaInstallButton.jsx");
  const globals = read("src/app/globals.css");

  assert.doesNotMatch(button, /installHintVisible/);
  assert.doesNotMatch(button, /pwa-install-hint/);
  assert.doesNotMatch(button, /pwa-install__hint/);
  assert.doesNotMatch(globals, /\.pwa-install__hint/);
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
