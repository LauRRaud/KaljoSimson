const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const adminPage = readFileSync("src/app/admin/page.js", "utf8");
const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");

test("main admin page edits gallery selection from site content", () => {
  assert.doesNotMatch(adminPage, /getAdminArtworks/);
  assert.match(adminPage, /<AdminStudio initialContent=\{content\} \/>/);
  assert.doesNotMatch(adminPage, /href="\/admin\/artworks"/);
  assert.doesNotMatch(adminPage, />\s*Kunstiteosed\s*</);
});

test("admin studio renders the gallery section before the artists section", () => {
  assert.doesNotMatch(adminStudio, /AdminArtworksStudio/);
  assert.match(
    adminStudio,
    /<article className="admin-panel admin-panel--compact" id="admin-gallery">[\s\S]*?<h2>Galerii valik<\/h2>[\s\S]*?<article className="admin-panel admin-panel--compact" id="admin-artists">[\s\S]*?<p className="eyebrow">Kunstnikud<\/p>/,
  );
});

test("gallery section selects existing artist artworks", () => {
  assert.match(adminStudio, /galleryCandidates = draft\.artists\.flatMap/);
  assert.match(adminStudio, /toggleArtworkGallery/);
  assert.match(adminStudio, /showInGallery/);
  assert.match(adminStudio, /galleryOrder/);
  assert.match(adminStudio, />\s*Näita galeriis\s*</);
});
