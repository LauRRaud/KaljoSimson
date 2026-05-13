const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const footerYearBlock = css.match(/\.site-footer__year\s*\{[^}]*\}/)?.[0] ?? "";

test("footer year stays crisp and readable", () => {
  assert.notEqual(footerYearBlock, "");
  assert.match(
    footerYearBlock,
    /color:\s*var\(--text-soft\);[\s\S]*?font-variant-numeric:\s*lining-nums tabular-nums;[\s\S]*?font-weight:\s*500;[\s\S]*?letter-spacing:\s*0\.08em;/,
  );
  assert.doesNotMatch(footerYearBlock, /transform:\s*translateY/);
});
