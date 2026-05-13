const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");

test("mobile home hero keeps title and copy in one centered column", () => {
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title\s*\{[\s\S]*?padding:\s*148px 0 42px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__inner\s*\{[\s\S]*?gap:\s*0;[\s\S]*?width:\s*100vw;[\s\S]*?margin:\s*4px calc\(50% - 50vw\) 0;[\s\S]*?padding:\s*0;[\s\S]*?align-items:\s*center;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__brand\s*\{[\s\S]*?width:\s*min\(calc\(100vw - 44px\),\s*350px\);[\s\S]*?margin:\s*0 auto;[\s\S]*?font-size:\s*clamp\(3\.3rem,\s*14\.6vw,\s*5\.1rem\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__tagline\s*\{[\s\S]*?margin-top:\s*82px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__story\s*\{[\s\S]*?width:\s*100%;[\s\S]*?justify-content:\s*center;[\s\S]*?margin-top:\s*108px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__copy\s*\{[\s\S]*?width:\s*min\(calc\(100vw - 72px\),\s*320px\);[\s\S]*?max-width:\s*none;[\s\S]*?margin:\s*0 auto;/,
  );
});
