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
  const mountRule = getRule(".artwork-frame__mount");
  const darkObsidianRule = getRule("html[data-theme=\"dark\"] .artwork-frame__window--obsidian");

  assert.match(obsidianRule, /linear-gradient\(180deg,\s*#5f5a54 0%,\s*#45413d 32%,\s*#2f3035 68%,\s*#24252a 100%\)/);
  assert.match(ivoryRule, /linear-gradient\(180deg,\s*#fffaf1 0%,\s*#f0e7d9 38%,\s*#ded2bf 74%,\s*#f3eadf 100%\)/);
  assert.match(mountRule, /padding:\s*0;/);
  assert.doesNotMatch(ivoryRule, /#c9a979|#d7b98d/);
  assert.match(darkObsidianRule, /#fffaf1/);
  assert.doesNotMatch(darkObsidianRule, /#c9a979|#d7b98d/);
  assert.match(
    css,
    /html\[data-theme="dark"\]\s+\.artwork-frame__window--ivory\s*\{[\s\S]*?linear-gradient\(180deg,\s*#5f5a54 0%,\s*#45413d 32%,\s*#2f3035 68%,\s*#24252a 100%\)/,
  );
});
