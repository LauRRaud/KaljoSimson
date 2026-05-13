const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const galleryPage = readFileSync("src/app/gallery/page.js", "utf8");
const galleryClient = readFileSync("src/components/GalleryClient.jsx", "utf8");

test("public gallery page uses the room variant without changing artist galleries", () => {
  assert.match(galleryPage, /mainClassName="page-main--gallery"/);
  assert.match(galleryPage, /showFooter=\{false\}/);
  assert.match(galleryPage, /className="gallery-room-page"/);
  assert.match(galleryPage, /className="gallery-room-page__back inline-link"/);
  assert.doesNotMatch(galleryPage, /className="gallery-room-page__heading"/);
  assert.match(galleryPage, /<GalleryClient artist=\{galleryArtist\} locale=\{locale\} variant="room" \/>/);
  assert.match(galleryClient, /variant = "grid"/);
  assert.match(galleryClient, /const isRoom = variant === "room";/);
  assert.match(galleryClient, /isRoom \? \(/);
  assert.match(galleryClient, /className="gallery-grid"/);
});

test("gallery room is a horizontal wall with carousel-style controls", () => {
  assert.match(galleryClient, /className="gallery-room"/);
  assert.match(galleryClient, /className="gallery-room__viewport" ref=\{roomViewportRef\}/);
  assert.match(galleryClient, /className="gallery-room__wall"/);
  assert.doesNotMatch(galleryClient, /className="gallery-room__floor"/);
  assert.match(galleryClient, /onClick=\{\(\) => scrollRoom\(-1\)\}/);
  assert.match(galleryClient, /onClick=\{\(\) => scrollRoom\(1\)\}/);
  assert.match(galleryClient, /viewport\.scrollBy\(\{/);
});

test("gallery room styling creates a clean wall and responsive artwork rhythm", () => {
  assert.match(css, /\.page-main--gallery\s*\{[\s\S]*?min-height:\s*100svh;/);
  assert.match(css, /\.gallery-room-page\s*\{[\s\S]*?min-height:\s*100svh;/);
  assert.match(css, /\.gallery-room-page__back\s*\{[\s\S]*?position:\s*absolute;/);
  assert.match(css, /\.gallery-room\s*\{[\s\S]*?min-height:\s*100svh;/);
  assert.doesNotMatch(css, /\.gallery-room::before\s*\{[\s\S]*?repeating-linear-gradient\(90deg,/);
  assert.match(css, /\.gallery-room__viewport\s*\{[\s\S]*?min-height:\s*100svh;[\s\S]*?overflow-x:\s*auto;[\s\S]*?scroll-snap-type:\s*x mandatory;/);
  assert.match(css, /\.gallery-room__wall\s*\{[\s\S]*?display:\s*flex;[\s\S]*?min-width:\s*max-content;/);
  assert.match(css, /\.gallery-room__slot\s*\{[\s\S]*?scroll-snap-align:\s*center;/);
  assert.match(css, /\.gallery-room \.artwork-frame__window\s*\{[\s\S]*?height:\s*clamp\(270px,\s*23vw,\s*410px\);/);
  assert.doesNotMatch(css, /\.gallery-room__floor\s*\{/);
  assert.match(css, /\.gallery-room__nav--prev\s*\{[\s\S]*?left:\s*clamp\(18px,\s*3vw,\s*44px\);/);
  assert.match(css, /\.gallery-room__nav span\s*\{[\s\S]*?border-top:\s*5px solid currentColor;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room__slot\s*\{[\s\S]*?flex-basis:\s*min\(78vw,\s*310px\);/);
});

test("dark mode keeps the gallery room consistent with the site atmosphere", () => {
  assert.match(css, /html\[data-theme="dark"\] \.gallery-room\s*\{[\s\S]*?linear-gradient\(180deg,\s*rgba\(28,\s*28,\s*27,\s*0\.98\)/);
  assert.doesNotMatch(css, /html\[data-theme="dark"\] \.gallery-room::before\s*\{[\s\S]*?repeating-linear-gradient\(90deg,/);
  assert.doesNotMatch(css, /html\[data-theme="dark"\] \.gallery-room__floor\s*\{/);
});
