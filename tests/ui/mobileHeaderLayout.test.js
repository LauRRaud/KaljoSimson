const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const languageSwitchSource = readFileSync("src/components/LanguageSwitch.jsx", "utf8");

test("mobile header keeps navigation on one responsive touchable row", () => {
  assert.match(css, /\.site-header\s*\{[\s\S]*?z-index:\s*50;/);

  const narrowNavRule = /@media \(max-width:\s*430px\)\s*\{[\s\S]*?\.site-nav\s*\{[\s\S]*?width:\s*auto;[\s\S]*?max-width:\s*calc\(100vw - 20px\);[\s\S]*?flex-wrap:\s*nowrap;[\s\S]*?overflow:\s*visible;/;
  const narrowLinksRule = /@media \(max-width:\s*430px\)\s*\{[\s\S]*?\.site-nav__links\s*\{[\s\S]*?flex:\s*1 1 auto;[\s\S]*?gap:\s*8px;/;
  const narrowControlsRule = /@media \(max-width:\s*430px\)\s*\{[\s\S]*?\.site-nav__controls\s*\{[\s\S]*?padding-left:\s*6px;[\s\S]*?pointer-events:\s*auto;/;
  const touchRule = /@media \(max-width:\s*430px\)\s*\{[\s\S]*?\.site-nav a,\s*[\s\S]*?\.language-switch__item,\s*[\s\S]*?\.theme-toggle\s*\{[\s\S]*?pointer-events:\s*auto;[\s\S]*?touch-action:\s*manipulation;/;

  assert.match(css, narrowNavRule);
  assert.match(css, narrowLinksRule);
  assert.match(css, narrowControlsRule);
  assert.match(css, touchRule);
});

test("language switch does not show native tooltip or extra hover button", () => {
  assert.doesNotMatch(languageSwitchSource, /title=\{switchText\}/);
  assert.match(languageSwitchSource, /aria-label=\{switchText\}/);
  assert.match(
    css,
    /\.language-switch__item:hover,\s*[\s\S]*?\.language-switch__item:focus-visible\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/,
  );
});
