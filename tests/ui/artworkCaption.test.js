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

test("artwork frame variants swap between light and dark themes", () => {
  const obsidianRule = getRule(".artwork-frame__window--obsidian");
  const ivoryRule = getRule(".artwork-frame__window--ivory");
  const darkObsidianRule = getRule("html[data-theme=\"dark\"] .artwork-frame__window--obsidian");

  assert.match(obsidianRule, /#17181d/);
  assert.match(ivoryRule, /#f6f1e7/);
  assert.doesNotMatch(ivoryRule, /#c9a979|#d7b98d/);
  assert.match(darkObsidianRule, /#f6f1e7/);
  assert.doesNotMatch(darkObsidianRule, /#c9a979|#d7b98d/);
  assert.match(
    css,
    /html\[data-theme="dark"\]\s+\.artwork-frame__window--ivory\s*\{[\s\S]*?#0d0d10/,
  );
});
