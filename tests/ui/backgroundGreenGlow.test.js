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
