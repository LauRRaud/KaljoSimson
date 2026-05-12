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

test("contact buttons do not change text color on hover in light or dark mode", () => {
  const hoverRule = getRule(".contact-inline__line:hover");
  const darkHoverRule = getRule('html[data-theme="dark"] .contact-inline__line:hover');

  assert.match(hoverRule, /color:\s*var\(--text\);/);
  assert.doesNotMatch(hoverRule, /color:\s*var\(--gold-strong\);/);
  assert.match(darkHoverRule, /color:\s*var\(--text\);/);
  assert.doesNotMatch(darkHoverRule, /color:\s*var\(--gold-strong\);/);
});
