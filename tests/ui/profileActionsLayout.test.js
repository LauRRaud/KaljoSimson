const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");

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

test("artist profile enquiry action sits on the right side of the tag row", () => {
  const tagsActionsRule = getRule(".profile-tags-actions");
  const tagsRule = getRule(".profile-tags-actions .pill-row");
  const actionsRule = getRule(".profile-actions");

  assert.match(tagsActionsRule, /display:\s*flex;/);
  assert.match(tagsActionsRule, /justify-content:\s*space-between;/);
  assert.match(tagsRule, /flex:\s*1\s+1\s+auto;/);
  assert.match(actionsRule, /justify-content:\s*flex-end;/);
  assert.match(actionsRule, /margin-left:\s*auto;/);
});

test("artist profile makes biography heading match gallery heading typography at a smaller size", () => {
  const introCopyRule = getRule(".profile-copy .section-copy");
  const biographyHeadingRule = getRule(".profile-biography .eyebrow");
  const biographyCopyRule = getRule(".profile-biography .section-copy");

  assert.match(introCopyRule, /font-size:\s*clamp\(1\.14rem,\s*1\.46vw,\s*1\.34rem\);/);
  assert.match(biographyHeadingRule, /font-family:\s*var\(--font-heading\);/);
  assert.match(biographyHeadingRule, /font-weight:\s*600;/);
  assert.match(biographyHeadingRule, /letter-spacing:\s*var\(--tracking-heading\);/);
  assert.match(biographyHeadingRule, /line-height:\s*0\.96;/);
  assert.match(biographyHeadingRule, /text-transform:\s*none;/);
  assert.match(biographyHeadingRule, /font-size:\s*clamp\(1\.9rem,\s*3vw,\s*2\.7rem\);/);
  assert.match(biographyCopyRule, /font-size:\s*clamp\(1\.06rem,\s*1\.28vw,\s*1\.2rem\);/);
});
