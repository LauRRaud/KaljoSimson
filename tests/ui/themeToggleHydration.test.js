const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const source = readFileSync("src/components/ThemeToggle.jsx", "utf8");

test("theme toggle uses server-stable initial render before reading storage", () => {
  assert.match(source, /useSyncExternalStore/);
  assert.match(source, /function getServerThemeSnapshot\(\)\s*\{\s*return "light";\s*\}/);
  assert.doesNotMatch(source, /useState\(getInitialTheme\)/);
  assert.match(source, /window\.localStorage\.getItem\(STORAGE_KEY\)/);
});
