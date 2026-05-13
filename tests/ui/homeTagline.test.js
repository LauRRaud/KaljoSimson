const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const homePage = readFileSync("src/app/page.js", "utf8");
const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("homepage renders tagline between brand and hero copy only when it has content", () => {
  assert.match(homePage, /const tagline = getCopy\(content\.site\.tagline, locale\)\.trim\(\);/);
  assert.match(
    homePage,
    /<h1 className="home-title__brand">\{content\.site\.title\}<\/h1>\s*\{tagline \? <p className="home-title__tagline">\{tagline\}<\/p> : null\}\s*<div className="home-title__story">/,
  );
});

test("admin studio exposes the tagline field again", () => {
  assert.match(adminStudio, /label="Tagline"/);
  assert.match(adminStudio, /updateSiteText\("tagline", locale, value\)/);
  assert.match(adminStudio, /value=\{draft\.site\.tagline\}/);
});

test("homepage stylesheet includes tagline styling", () => {
  assert.match(css, /\.home-title__tagline\s*\{[\s\S]*?text-align:\s*center;/);
});
