const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const pageLineWaves = readFileSync("src/components/PageLineWaves.jsx", "utf8");

function getRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test("shared page backgrounds do not include green light glows", () => {
  const bodyRule = getRule("body");
  const darkBodyRule = getRule('html[data-theme="dark"] body');
  const darkHomeGlowRule = getRule('html[data-theme="dark"] .home-title::before');

  assert.doesNotMatch(bodyRule, /rgba\(125,\s*154,\s*153,\s*0\.14\)/);
  assert.doesNotMatch(darkBodyRule, /rgba\(67,\s*132,\s*138,\s*0\.17\)/);
  assert.doesNotMatch(darkHomeGlowRule, /rgba\(82,\s*164,\s*158,\s*0\.16\)/);
  assert.doesNotMatch(pageLineWaves, /#10b981/i);
});

test("glass panels do not add their own radial light spot", () => {
  assert.match(
    css,
    /\.hero-panel::after,\s*\.section::after,\s*\.admin-shell::after,\s*\.admin-login::after\s*\{[\s\S]*?content:\s*none;/,
  );
});

test("artist profile panels use the same glass surface as contact", () => {
  const profileHeroRule = getRule(".profile-hero");
  const profileGalleryRule = getRule(".profile-hero + .section");

  assert.match(
    css,
    /\.section--contact\s*\{[\s\S]*?background:\s*var\(--glass-panel-bg\);[\s\S]*?box-shadow:\s*var\(--glass-panel-shadow\);[\s\S]*?border-radius:\s*28px;[\s\S]*?backdrop-filter:\s*var\(--glass-blur\);/,
  );
  assert.doesNotMatch(profileHeroRule, /--glass-panel-bg:\s*var\(--glass-panel-bg-strong\);/);
  assert.match(profileHeroRule, /border-radius:\s*28px;/);
  assert.doesNotMatch(profileGalleryRule, /--glass-panel-bg:\s*var\(--glass-panel-bg-strong\);/);
  assert.match(profileGalleryRule, /background:\s*var\(--glass-panel-bg\);/);
  assert.match(profileGalleryRule, /border-radius:\s*28px;/);
  assert.match(
    css,
    /\.profile-hero::before,\s*\.profile-hero \+ \.section::before\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*inset 0 0 0 1px rgba\(255,\s*255,\s*255,\s*0\.04\);[\s\S]*?backdrop-filter:\s*none;/,
  );
  assert.match(
    css,
    /html\[data-theme="dark"\] \.profile-hero::before,\s*html\[data-theme="dark"\] \.profile-hero \+ \.section::before\s*\{[\s\S]*?background:\s*transparent;/,
  );
});
