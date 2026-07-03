const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { readCss } = require("./readCss");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("PWA install button renders an iOS home screen fallback hint", () => {
  const button = read("src/components/PwaInstallButton.jsx");
  const globals = readCss();

  assert.match(button, /createPortal/);
  assert.match(button, /document\.body/);
  assert.match(button, /buttonRef/);
  assert.match(button, /getBoundingClientRect/);
  assert.match(button, /installHintVisible/);
  assert.match(button, /installHintPosition/);
  assert.match(button, /Jaga - Lisa avalehele/);
  assert.match(button, /Share - Add to Home Screen/);
  assert.doesNotMatch(button, /iosInstallFallback/);
  assert.doesNotMatch(button, /isIosInstallFallback/);
  assert.match(button, /className="pwa-install__hint"/);
  assert.match(button, /aria-live="polite"/);
  assert.match(globals, /\.pwa-install\s*{[^}]*z-index:\s*2;[^}]*isolation:\s*isolate;/s);
  assert.match(globals, /\.pwa-install__hint\s*{/);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*position:\s*fixed;/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*top:\s*var\(--pwa-install-hint-top,\s*0\);/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*left:\s*var\(--pwa-install-hint-left,\s*50vw\);/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*border:\s*none;/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*background:\s*var\(--glass-panel-bg\);/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*-webkit-backdrop-filter:\s*blur\(24px\) saturate\(1\.08\);/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*backdrop-filter:\s*blur\(24px\) saturate\(1\.08\);/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*transform:\s*translateX\(-50%\) translateZ\(0\);/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*will-change:\s*backdrop-filter;/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*box-shadow:\s*none;/s);
  assert.match(globals, /\.pwa-install__hint\s*{[^}]*z-index:\s*1000;/s);
  assert.doesNotMatch(globals, /\.pwa-install__hint::before\s*{/);
  assert.doesNotMatch(globals, /\.site-nav:has\(\.pwa-install__hint\)/);
  assert.doesNotMatch(globals, /html\[data-theme="dark"\] \.pwa-install__hint\s*{[^}]*background:/s);
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
