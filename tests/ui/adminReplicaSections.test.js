const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");
const content = readFileSync("content/site-content.json", "utf8");

test("homepage admin section is rendered as a full-width replica editor", () => {
  assert.match(adminStudio, /admin-panel admin-panel--compact admin-home-editor/);
  assert.match(adminStudio, /<h1 className="home-title__brand admin-home-editor__brand">\{draft\.site\.title\}<\/h1>/);
  assert.match(adminStudio, /className="home-title__tagline admin-home-editor__tagline"/);
  assert.match(adminStudio, /className="home-title__copy admin-home-editor__copy"/);
  assert.match(adminStudio, /<section className="admin-home-editor__contact" aria-label="Kontakti eelvaade">/);
  assert.match(adminStudio, /renderContactCopy\(siteContactText\)/);
});

test("homepage replica editor has dedicated responsive styles", () => {
  assert.match(css, /\.admin-home-editor__canvas\s*\{/);
  assert.match(css, /\.admin-home-editor__brand\s*\{[\s\S]*?font-size:\s*clamp\(3\.6rem,\s*10vw,\s*7\.8rem\);/);
  assert.match(css, /\.admin-home-editor__control\s*\{[\s\S]*?width:\s*min\(100%,\s*760px\);/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.admin-home-editor__brand\s*\{[\s\S]*?font-size:\s*clamp\(2\.9rem,\s*12vw,\s*4\.7rem\);/);
});

test("default site tagline is the selected short homepage tagline", () => {
  assert.match(content, /"et":\s*"Kunst väljaspool raame"/);
  assert.match(content, /"en":\s*"Art beyond the frame"/);
});

test("artist admin section follows the public artist profile structure", () => {
  assert.match(adminStudio, /<section className="admin-artist-editor profile-hero">/);
  assert.match(adminStudio, /className="profile-copy admin-artist-editor__copy"/);
  assert.match(adminStudio, /className="profile-copy__lead"/);
  assert.match(adminStudio, /className="profile-tags-actions admin-artist-editor__tags"/);
  assert.match(adminStudio, /className="profile-biography admin-artist-editor__biography"/);
  assert.match(adminStudio, /getCopy\(artist\.biography, editorLocale\)[\s\S]*?\.split\(\/\\n\\s\*\\n\/\)/);
});

test("artist replica editor has profile-specific admin styling", () => {
  assert.match(css, /\.admin-artist-editor\s*\{/);
  assert.match(css, /\.admin-artist-editor__portrait > \.portrait-shell\s*\{[\s\S]*?aspect-ratio:\s*1\.2 \/ 1;/);
  assert.match(css, /\.admin-artist-editor__biography \.textarea\s*\{[\s\S]*?min-height:\s*180px;/);
});
