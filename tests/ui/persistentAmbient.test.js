const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const layout = readFileSync("src/app/layout.js", "utf8");
const pageShell = readFileSync("src/components/PageShell.jsx", "utf8");
const siteAmbient = readFileSync("src/components/SiteAmbient.jsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("ambient WebGL effects are mounted once from the root layout", () => {
  assert.match(layout, /import SiteAmbient from "@\/components\/SiteAmbient";/);
  assert.match(layout, /<SiteAmbient \/>[\s\S]*?\{children\}/);
  assert.doesNotMatch(pageShell, /PageLineWaves|SplashCursor/);
});

test("persistent ambient layer keeps route-specific visibility rules", () => {
  assert.match(siteAmbient, /usePathname/);
  assert.match(siteAmbient, /pathname === "\/gallery"/);
  assert.match(siteAmbient, /pathname\?\.startsWith\("\/admin"\)/);
  assert.match(siteAmbient, /site-ambient--gallery-room/);
  assert.match(siteAmbient, /<PageLineWaves \/>/);
  assert.match(siteAmbient, /<\/div>[\s\S]*?\{isAdmin \|\| isStudio \? null : <SplashCursor \/>\}/);
  assert.match(siteAmbient, /isAdmin \? null : <BrushCursor \/>/);
});

test("ambient layer sits between page surfaces and page content", () => {
  assert.match(css, /\.site-ambient\s*\{[\s\S]*?z-index:\s*1;[\s\S]*?isolation:\s*isolate;/);
  assert.match(css, /\.site-ambient\s*\{[\s\S]*?transition:\s*opacity 1600ms ease;/);
  assert.match(css, /\.site-ambient--gallery-room\s*\{[\s\S]*?opacity:\s*0;/);
  assert.match(css, /\.site-ambient \.page-line-waves\s*\{[\s\S]*?z-index:\s*0;/);
  assert.match(css, /\.page-shell--gallery-surface::before\s*\{[\s\S]*?z-index:\s*0;/);
  assert.match(css, /\.page-main\s*\{[\s\S]*?z-index:\s*2;/);
  assert.match(css, /\.admin-page\s*\{[\s\S]*?z-index:\s*2;/);
});
