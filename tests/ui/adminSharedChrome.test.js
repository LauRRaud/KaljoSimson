const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const adminPage = readFileSync("src/app/admin/page.js", "utf8");
const adminArtworksPage = readFileSync("src/app/admin/artworks/page.js", "utf8");
const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("admin login and content page use shared page-shell background chrome", () => {
  assert.match(adminPage, /import PageLineWaves from "@\/components\/PageLineWaves";/);
  assert.match(adminPage, /className="page-shell admin-page-shell"/);
  assert.match(adminPage, /<PageLineWaves \/>/);
  assert.match(adminPage, /className="site-nav admin-topbar admin-topbar--login"/);
  assert.match(adminPage, /href="\/"[\s\S]*?Avalehele/);
});

test("admin studio renders a top glass control bar with theme and locale controls", () => {
  assert.match(adminStudio, /import ThemeToggle from "@\/components\/ThemeToggle";/);
  assert.match(adminStudio, /className="site-nav admin-topbar"/);
  assert.match(adminStudio, /href="#admin-site"/);
  assert.match(adminStudio, /href="#admin-gallery"/);
  assert.match(adminStudio, /href="#admin-artists"/);
  assert.match(adminStudio, /<ThemeToggle locale=\{editorLocale\} \/>/);
  assert.match(adminStudio, /id="admin-gallery"[\s\S]*?<h2>Galerii valik<\/h2>/);
});

test("admin fallback gallery route uses the same shared chrome system", () => {
  assert.match(adminArtworksPage, /import PageLineWaves from "@\/components\/PageLineWaves";/);
  assert.match(adminArtworksPage, /className="page-shell admin-page-shell"/);
  assert.match(adminArtworksPage, /className="site-nav admin-topbar admin-topbar--subpage"/);
});

test("admin stylesheet defines the shared topbar and page-shell styles", () => {
  assert.match(css, /\.admin-page-shell\s*\{/);
  assert.match(css, /\.admin-login-wrap\s*\{/);
  assert.match(css, /\.admin-topbar\s*\{/);
  assert.match(css, /\.admin-topbar__locale-copy\s*\{/);
  assert.match(css, /\.admin-section-actions\s*\{/);
});
