const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const source = readFileSync("src/components/SplashCursor.jsx", "utf8");

test("splash cursor default radius is slightly larger", () => {
  assert.match(source, /SPLAT_RADIUS = 0\.007,/);
  assert.match(source, /correctRadius\(config\.SPLAT_RADIUS \/ 100\.0\)/);
});

test("splash cursor renders above glass panels without blocking interaction", () => {
  assert.match(source, /zIndex:\s*20,/);
  assert.match(source, /pointerEvents:\s*"none"/);
});
