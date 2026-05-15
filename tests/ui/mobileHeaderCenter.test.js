const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("mobile header panel is centered without desktop offset", () => {
  const globals = read("src/app/globals.css");

  assert.match(
    globals,
    /@media \(max-width:\s*760px\)[\s\S]*?\.site-header__inner\s*{[^}]*align-items:\s*center;[^}]*transform:\s*none;/s,
  );
});
