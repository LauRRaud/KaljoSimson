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

test("artist profile enquiry action anchors to the lower right of the copy column", () => {
  const heroRule = getRule(".profile-hero");
  const copyRule = getRule(".profile-copy");
  const actionsRule = getRule(".profile-actions");

  assert.match(heroRule, /align-items:\s*stretch;/);
  assert.match(copyRule, /align-self:\s*stretch;/);
  assert.match(copyRule, /min-height:\s*100%;/);
  assert.match(actionsRule, /align-self:\s*stretch;/);
  assert.match(actionsRule, /justify-content:\s*flex-end;/);
  assert.match(actionsRule, /margin-top:\s*auto;/);
});
