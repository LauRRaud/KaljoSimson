const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const artworkFrame = readFileSync("src/components/ArtworkFrame.jsx", "utf8");

function getRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test("artwork captions show title, year, and size in one centered row", () => {
  const captionRule = getRule(".artwork-frame__caption");
  const rowRule = getRule(".artwork-frame__caption p");
  const titleRule = getRule(".artwork-frame__caption p span:first-child");

  assert.match(captionRule, /align-items:\s*center;/);
  assert.match(captionRule, /text-align:\s*center;/);
  assert.match(rowRule, /display:\s*flex;/);
  assert.match(rowRule, /justify-content:\s*center;/);
  assert.match(titleRule, /font-family:\s*var\(--font-display\);/);
  assert.doesNotMatch(artworkFrame, /<h3>/);
  assert.match(artworkFrame, /<span>\{getCopy\(artwork\.title,\s*locale\)\}<\/span>/);
  assert.match(artworkFrame, /<span>\{artwork\.year\}<\/span>/);
  assert.match(artworkFrame, /<span>\{artwork\.size\}<\/span>/);
});
