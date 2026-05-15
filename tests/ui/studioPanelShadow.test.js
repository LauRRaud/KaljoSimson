const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");

test("studio settings and canvas panels use the artwork object shadow", () => {
  assert.match(
    css,
    /\.studio-toolbar,\s*\.studio-paper\s*\{[\s\S]*?box-shadow:\s*[\s\S]*?0 0 0 1px var\(--glass-ring\),[\s\S]*?var\(--artwork-object-shadow\);/,
  );
  assert.match(css, /--artwork-object-shadow:\s*[\s\S]*?0 22px 26px -20px rgba\(75,\s*52,\s*28,\s*0\.24\);/);
  assert.match(
    css,
    /html\[data-theme="dark"\]\s*\{[\s\S]*?--artwork-object-shadow:[\s\S]*?0 22px 26px -20px rgba\(0,\s*0,\s*0,\s*0\.28\);/,
  );
});

test("header and studio close controls use the shared floating shadows", () => {
  assert.match(
    css,
    /\.site-nav\s*\{[\s\S]*?box-shadow:\s*[\s\S]*?0 0 0 1px var\(--glass-ring\),[\s\S]*?var\(--artwork-object-shadow\);/,
  );
  assert.match(css, /\.studio-close-link\s*\{[\s\S]*?box-shadow:\s*var\(--floating-control-shadow\);/);
  assert.match(
    css,
    /\.studio-close-link:hover,\s*\.studio-close-link:focus-visible\s*\{[\s\S]*?box-shadow:\s*var\(--floating-control-shadow-hover\);/,
  );
});
