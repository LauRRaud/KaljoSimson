const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { readCss } = require("./readCss");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("site footer ends with centered byline", () => {
  const footer = read("src/components/SiteFooter.jsx");

  assert.match(footer, /className="site-footer__byline"/);
  assert.match(footer, />by L\. Raudsoo</);
  assert.ok(
    footer.indexOf("site-footer__byline") > footer.indexOf("site-footer__year"),
    "byline should appear after the footer year",
  );

  const globals = readCss();

  assert.match(
    globals,
    /\.site-footer__inner\s*{[^}]*padding:\s*54px 0 calc\(24px \+ env\(safe-area-inset-bottom, 0px\)\);/s,
  );
  assert.match(globals, /\.site-footer__byline\s*{[^}]*font-size:\s*0\.95rem;/s);
  assert.match(globals, /\.site-footer__byline\s*{[^}]*margin-top:\s*16px;/s);
  assert.match(globals, /\.site-footer__byline\s*{[^}]*opacity:\s*0\.68;/s);
  assert.doesNotMatch(globals, /\.site-footer__byline\s*{[^}]*text-transform:\s*uppercase;/s);
});
