const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const languageSwitchSource = readFileSync("src/components/LanguageSwitch.jsx", "utf8");

test("mobile header keeps navigation on one responsive touchable row", () => {
  assert.match(css, /\.site-header\s*\{[\s\S]*?z-index:\s*50;/);

  const mobileHeaderRule = /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.site-header__inner\s*\{[\s\S]*?width:\s*100%;[\s\S]*?margin:\s*0;[\s\S]*?padding:\s*14px 16px 0;[\s\S]*?align-items:\s*stretch;/;
  const mobileNavRule = /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.site-nav\s*\{[\s\S]*?display:\s*flex;[\s\S]*?gap:\s*26px;[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*100vw;[\s\S]*?justify-content:\s*center;[\s\S]*?padding:\s*18px 28px;[\s\S]*?border-radius:\s*999px;/;
  const narrowNavRule = /@media \(max-width:\s*430px\)\s*\{[\s\S]*?\.site-nav\s*\{[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*100vw;[\s\S]*?flex-wrap:\s*nowrap;[\s\S]*?justify-content:\s*center;[\s\S]*?gap:\s*10px;[\s\S]*?padding:\s*14px 10px;[\s\S]*?overflow:\s*visible;[\s\S]*?border-radius:\s*999px;/;
  const narrowLinksRule = /@media \(max-width:\s*430px\)\s*\{[\s\S]*?\.site-nav__links\s*\{[\s\S]*?flex:\s*0 1 auto;[\s\S]*?gap:\s*10px;/;
  const narrowControlsRule = /@media \(max-width:\s*430px\)\s*\{[\s\S]*?\.site-nav__controls\s*\{[\s\S]*?gap:\s*10px;[\s\S]*?padding-left:\s*0;[\s\S]*?border-left:\s*none;[\s\S]*?pointer-events:\s*auto;/;
  const themeToggleLinkRule = /\.site-nav \.theme-toggle\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;[\s\S]*?backdrop-filter:\s*none;/;
  const touchRule = /@media \(max-width:\s*430px\)\s*\{[\s\S]*?\.site-nav a,\s*[\s\S]*?\.language-switch__item,\s*[\s\S]*?\.theme-toggle\s*\{[\s\S]*?pointer-events:\s*auto;[\s\S]*?touch-action:\s*manipulation;/;

  assert.match(css, mobileHeaderRule);
  assert.match(css, mobileNavRule);
  assert.match(css, narrowNavRule);
  assert.match(css, narrowLinksRule);
  assert.match(css, narrowControlsRule);
  assert.match(css, themeToggleLinkRule);
  assert.match(css, touchRule);
});

test("language switch does not show native tooltip or extra hover button", () => {
  assert.doesNotMatch(languageSwitchSource, /title=\{switchText\}/);
  assert.match(languageSwitchSource, /aria-label=\{switchText\}/);
  assert.match(css, /\.language-switch__flag\s*\{[\s\S]*?box-shadow:\s*none;/);
  assert.match(
    css,
    /\.language-switch__item:hover,\s*[\s\S]*?\.language-switch__item:focus-visible\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/,
  );
});
