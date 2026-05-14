const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const homePage = readFileSync("src/app/page.js", "utf8");
const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("homepage renders tagline between brand and hero copy only when it has content", () => {
  assert.match(homePage, /const tagline = getCopy\(content\.site\.tagline, locale\)\.trim\(\)\.replace\(",", ""\);/);
  assert.match(homePage, /function renderTaglineWords\(words\)/);
  assert.match(homePage, /words\.map\(\(word, index\) =>/);
  assert.match(homePage, /className="home-title__tagline-word"/);
  assert.match(homePage, /style=\{\{[\s\S]*?"--word-index": index,[\s\S]*?\}\}/);
  assert.match(homePage, /"--word-delay": `\$\{index \* desktopWordStep\}s`/);
  assert.match(homePage, /const mobileWordStep = desktopWordStep;/);
  assert.match(homePage, /const mobileCycleEndPause = desktopCycleEndPause;/);
  assert.match(homePage, /"--word-mobile-delay": `\$\{index \* mobileWordStep\}s`/);
  assert.match(homePage, /const taglineWords = tagline \? tagline\.split\(\/\\s\+\/\) : \[\];/);
  assert.match(homePage, /function renderHomeTitle\(title\)/);
  assert.match(
    homePage,
    /<h1 className="home-title__brand" aria-label=\{content\.site\.title\}>\s*\{renderHomeTitle\(content\.site\.title\)\}\s*<\/h1>\s*\{tagline \? \(\s*<p\s*className="home-title__tagline"\s*aria-label=\{tagline\}\s*style=\{\{\s*"--tagline-cycle-duration": `\$\{taglineWords\.length \* desktopWordStep \+ desktopCycleEndPause\}s`,\s*"--tagline-mobile-cycle-duration": `\$\{taglineWords\.length \* mobileWordStep \+ mobileCycleEndPause\}s`,\s*\}\}\s*>\s*\{renderTaglineWords\(taglineWords\)\}\s*<\/p>\s*\) : null\}\s*<div className="home-title__story">/,
  );
});

test("admin studio exposes the tagline field again", () => {
  assert.match(adminStudio, /label="Tagline"/);
  assert.match(adminStudio, /updateSiteText\("tagline", locale, value\)/);
  assert.match(adminStudio, /value=\{draft\.site\.tagline\}/);
});

test("homepage stylesheet includes tagline styling", () => {
  assert.match(css, /:root\s*\{[\s\S]*?--home-tagline-text:\s*rgba\(24,\s*21,\s*18,\s*0\.68\);/);
  assert.match(css, /\.home-title__tagline\s*\{[\s\S]*?color:\s*var\(--home-tagline-text\);[\s\S]*?font-family:\s*var\(--font-tagline\);[\s\S]*?font-size:\s*clamp\(1\.26rem,\s*1\.48vw,\s*1\.68rem\);[\s\S]*?font-weight:\s*500;[\s\S]*?letter-spacing:\s*0\.16em;[\s\S]*?text-align:\s*center;/);
  assert.match(css, /\.home-title__tagline-word\s*\{[\s\S]*?animation:\s*home-title-shine var\(--tagline-cycle-duration,\s*14\.8s\) linear infinite;[\s\S]*?animation-delay:\s*calc\(var\(--tagline-entrance-delay,\s*3s\) \+ var\(--word-delay,\s*0s\)\);/);
});
