const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const adminPage = readFileSync("src/app/admin/page.js", "utf8");
const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");
const adminArtworksStudio = readFileSync("src/components/AdminArtworksStudio.jsx", "utf8");

test("main admin page loads gallery artworks directly instead of linking to a separate artworks page", () => {
  assert.match(adminPage, /getAdminArtworks/);
  assert.match(adminPage, /<AdminStudio initialContent=\{content\} artworks=\{artworks\} \/>/);
  assert.doesNotMatch(adminPage, /href="\/admin\/artworks"/);
  assert.doesNotMatch(adminPage, />\s*Kunstiteosed\s*</);
});

test("admin studio renders the gallery section before the artists section", () => {
  assert.match(adminStudio, /import AdminArtworksStudio from "@\/components\/AdminArtworksStudio";/);
  assert.match(
    adminStudio,
    /<AdminArtworksStudio artworks=\{artworks\} embedded \/>[\s\S]*?<article className="admin-panel admin-panel--compact" id="admin-artists">[\s\S]*?<p className="eyebrow">Kunstnikud<\/p>/,
  );
});

test("embedded artworks studio is presented as gallery", () => {
  assert.match(adminArtworksStudio, /function AdminArtworksStudio\(\{ artworks, embedded = false \}\)/);
  assert.match(adminArtworksStudio, /<h2>Galerii<\/h2>/);
});
