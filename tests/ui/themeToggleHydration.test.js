const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const source = readFileSync("src/components/ThemeToggle.jsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("theme toggle uses server-stable initial render before reading storage", () => {
  assert.match(source, /useSyncExternalStore/);
  assert.match(source, /function getServerThemeSnapshot\(\)\s*\{\s*return "light";\s*\}/);
  assert.doesNotMatch(source, /useState\(getInitialTheme\)/);
  assert.match(source, /window\.localStorage\.getItem\(STORAGE_KEY\)/);
});

test("theme toggle visible text follows the bootstrapped html theme before hydration settles", () => {
  assert.match(source, /theme-toggle__label--to-dark/);
  assert.match(source, /theme-toggle__label--to-light/);
  assert.match(
    css,
    /\.theme-toggle__label--to-light\s*\{[\s\S]*?display:\s*none;/,
  );
  assert.match(
    css,
    /html\[data-theme="dark"\]\s+\.theme-toggle__label--to-dark\s*\{[\s\S]*?display:\s*none;/,
  );
  assert.match(
    css,
    /html\[data-theme="dark"\]\s+\.theme-toggle__label--to-light\s*\{[\s\S]*?display:\s*inline;/,
  );
});
