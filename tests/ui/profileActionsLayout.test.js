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
