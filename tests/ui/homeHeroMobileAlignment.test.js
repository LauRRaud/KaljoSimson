const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");

test("mobile home hero keeps title and copy in one centered column", () => {
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__inner\s*\{[\s\S]*?width:\s*min\(100%,\s*360px\);[\s\S]*?margin:\s*24px auto 0;[\s\S]*?padding:\s*0 18px;[\s\S]*?align-items:\s*center;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__brand\s*\{[\s\S]*?width:\s*100%;[\s\S]*?margin:\s*0 auto;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__story\s*\{[\s\S]*?width:\s*100%;[\s\S]*?justify-content:\s*center;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__copy\s*\{[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*none;[\s\S]*?margin:\s*30px auto 0;/,
  );
});
