const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { readCss } = require("./readCss");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("artist profile uses wider mobile content width", () => {
  const page = read("src/app/artists/[slug]/page.js");
  const globals = readCss();

  assert.match(page, /mainClassName="page-main--profile"/);
  assert.match(
    globals,
    /@media \(max-width:\s*760px\)[\s\S]*?\.page-main--profile\s*{[^}]*width:\s*min\(100%,\s*calc\(100vw - 16px\)\);/s,
  );
  assert.match(
    globals,
    /\.profile-hero\s*{[^}]*max-width:\s*100%;[^}]*padding-inline:\s*clamp\(14px,\s*4vw,\s*18px\);/s,
  );
  assert.match(
    globals,
    /\.profile-copy,[\s\S]*?\.profile-tags-actions \.pill-row\s*{[^}]*max-width:\s*calc\(100vw - 48px\);/s,
  );
});
