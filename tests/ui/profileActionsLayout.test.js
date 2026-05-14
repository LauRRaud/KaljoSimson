const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const artistPage = readFileSync("src/app/artists/[slug]/page.js", "utf8");

function getRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test("artist profile biography spans the page width below the portrait row", () => {
  const biographyRule = getRule(".profile-biography");

  assert.match(biographyRule, /grid-column:\s*1\s*\/\s*-1;/);
});

test("artist profile keeps the tag row as a full-width strip without an enquiry action", () => {
  const tagsActionsRule = getRule(".profile-tags-actions");
  const tagsRule = getRule(".profile-tags-actions .pill-row");

  assert.match(tagsActionsRule, /display:\s*flex;/);
  assert.match(tagsActionsRule, /justify-content:\s*space-between;/);
  assert.match(tagsRule, /flex:\s*1\s+1\s+auto;/);
  assert.doesNotMatch(artistPage, /Ask about works|Küsi teoste kohta/);
});

test("artist profile keeps biography heading in eyebrow style but larger", () => {
  const introCopyRule = getRule(".profile-copy .section-copy");
  const biographyHeadingRule = getRule(".profile-biography .eyebrow");
  const biographyCopyRule = getRule(".profile-biography .section-copy");

  assert.match(introCopyRule, /font-size:\s*clamp\(1\.14rem,\s*1\.46vw,\s*1\.34rem\);/);
  assert.match(biographyHeadingRule, /font-size:\s*clamp\(1\.14rem,\s*1\.46vw,\s*1\.34rem\);/);
  assert.doesNotMatch(biographyHeadingRule, /font-family:\s*var\(--font-heading\);/);
  assert.doesNotMatch(biographyHeadingRule, /text-transform:\s*none;/);
  assert.match(biographyCopyRule, /font-size:\s*clamp\(1\.06rem,\s*1\.28vw,\s*1\.2rem\);/);
});

test("artist profile portrait uses the same soft light shadow as the carousel", () => {
  const portraitRule = getRule(".profile-hero > .portrait-shell");

  assert.match(portraitRule, /0\s+16px\s+18px\s+-14px\s+rgba\(75,\s*52,\s*28,\s*0\.36\)/);
  assert.match(portraitRule, /0\s+26px\s+30px\s+-24px\s+rgba\(75,\s*52,\s*28,\s*0\.24\)/);
});

test("artist profile back link uses short copy", () => {
  const profileNavRule = getRule(".profile-nav");

  assert.match(artistPage, /locale === "en" \? "Back" : "Tagasi"/);
  assert.doesNotMatch(artistPage, /Back to homepage|Tagasi avalehele/);
  assert.match(profileNavRule, /margin-top:\s*-14px;/);
  assert.match(profileNavRule, /margin-bottom:\s*-6px;/);
});

test("artist profile panel expands wider on mobile", () => {
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.profile-hero\s*\{[\s\S]*?width:\s*calc\(100% \+ 32px\);[\s\S]*?margin-inline:\s*-16px;[\s\S]*?padding-inline:\s*22px;/,
  );
});
