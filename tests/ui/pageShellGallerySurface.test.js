const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const homePage = readFileSync("src/app/page.js", "utf8");
const artistPage = readFileSync("src/app/artists/[slug]/page.js", "utf8");
const pageShell = readFileSync("src/components/PageShell.jsx", "utf8");

test("page shell accepts an optional gallery-surface class", () => {
  assert.match(pageShell, /shellClassName = ""/);
  assert.match(pageShell, /className=\{`page-shell \$\{shellClassName\}`\.trim\(\)\}/);
});

test("home and artist pages opt into the gallery surface background", () => {
  assert.match(homePage, /shellClassName="page-shell--gallery-surface"/);
  assert.match(artistPage, /shellClassName="page-shell--gallery-surface"/);
});

test("gallery surface styling exists for light and dark themes", () => {
  assert.match(css, /\.page-shell--gallery-surface::before,\s*\.page-shell--gallery-surface::after\s*\{/);
  assert.match(css, /\.page-shell--gallery-surface::before\s*\{[\s\S]*?linear-gradient\(/);
  assert.match(css, /\.page-shell--gallery-surface::after\s*\{[\s\S]*?linear-gradient\(90deg,/);
  assert.match(css, /html\[data-theme="dark"\] \.page-shell--gallery-surface::before\s*\{[\s\S]*?rgba\(73,\s*72,\s*66,\s*0\.98\)/);
  assert.match(css, /html\[data-theme="dark"\] \.page-shell--gallery-surface::after\s*\{[\s\S]*?linear-gradient\(90deg,\s*rgba\(0,\s*0,\s*0,\s*0\.28\)/);
});
