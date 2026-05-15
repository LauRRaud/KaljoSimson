const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("artist biography uses language-aware readable line wrapping", () => {
  const page = read("src/app/artists/[slug]/page.js");
  const globals = read("src/app/globals.css");

  assert.match(page, /<div className="profile-biography" lang={locale}>/);
  assert.match(
    globals,
    /\.profile-biography \.section-copy\s*{[^}]*hyphens:\s*auto;[^}]*overflow-wrap:\s*normal;[^}]*text-wrap:\s*pretty;[^}]*word-break:\s*normal;/s,
  );
  assert.match(
    globals,
    /@media \(max-width:\s*760px\)[\s\S]*?\.profile-copy \.section-copy,\s*\.profile-biography \.section-copy\s*{[^}]*hyphens:\s*auto;[^}]*overflow-wrap:\s*normal;[^}]*text-wrap:\s*pretty;[^}]*word-break:\s*normal;/s,
  );
});
