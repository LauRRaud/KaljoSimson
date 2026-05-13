const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const homePage = readFileSync("src/app/page.js", "utf8");
const artistPage = readFileSync("src/app/artists/[slug]/page.js", "utf8");
const pageShell = readFileSync("src/components/PageShell.jsx", "utf8");

function getRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test("page shell accepts an optional gallery-surface class", () => {
  assert.match(pageShell, /shellClassName = ""/);
  assert.match(pageShell, /className=\{`page-shell \$\{shellClassName\}`\.trim\(\)\}/);
});

test("home and artist pages opt into the gallery surface background", () => {
  assert.match(homePage, /shellClassName="page-shell--gallery-surface"/);
  assert.match(artistPage, /shellClassName="page-shell--gallery-surface"/);
});

test("gallery surface styling exists for light and dark themes", () => {
  const darkSurfaceRule = getRule('html[data-theme="dark"] .page-shell--gallery-surface::before');
  const darkOverlayRule = getRule('html[data-theme="dark"] .page-shell--gallery-surface::after');

  assert.match(css, /\.page-shell--gallery-surface::before,\s*\.page-shell--gallery-surface::after\s*\{/);
  assert.match(css, /\.page-shell--gallery-surface::before\s*\{[\s\S]*?linear-gradient\(/);
  assert.match(css, /\.page-shell--gallery-surface::after\s*\{[\s\S]*?linear-gradient\(90deg,/);
  assert.match(darkSurfaceRule, /rgba\(25,\s*24,\s*22,\s*0\.99\)/);
  assert.doesNotMatch(darkSurfaceRule, /rgba\(73,\s*72,\s*66,\s*0\.98\)/);
  assert.match(darkOverlayRule, /linear-gradient\(180deg,\s*rgba\(0,\s*0,\s*0,\s*0\.18\)/);
});
