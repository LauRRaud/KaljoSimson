const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const source = readFileSync("src/components/SplashCursor.jsx", "utf8");

test("splash cursor uses a stronger pigment scale in light mode", () => {
  assert.match(source, /useSyncExternalStore/);
  assert.match(source, /const LIGHT_SPLASH_COLOR_SCALE = 0\.15;/);
  assert.match(source, /const DARK_SPLASH_COLOR_SCALE = 0\.13;/);
  assert.match(
    source,
    /const colorScale = theme === "light"\s*\?\s*LIGHT_SPLASH_COLOR_SCALE\s*:\s*DARK_SPLASH_COLOR_SCALE;/,
  );
  assert.match(source, /c\.r \*= colorScale;/);
  assert.match(source, /c\.g \*= colorScale;/);
  assert.match(source, /c\.b \*= colorScale;/);
});
