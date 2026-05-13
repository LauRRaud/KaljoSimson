const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const galleryPage = readFileSync("src/app/gallery/page.js", "utf8");
const galleryClient = readFileSync("src/components/GalleryClient.jsx", "utf8");

test("public gallery page uses the room variant without changing artist galleries", () => {
  assert.match(galleryPage, /className="section gallery-room-section"/);
  assert.match(galleryPage, /<GalleryClient artist=\{galleryArtist\} locale=\{locale\} variant="room" \/>/);
  assert.match(galleryClient, /variant = "grid"/);
  assert.match(galleryClient, /const isRoom = variant === "room";/);
  assert.match(galleryClient, /isRoom \? \(/);
  assert.match(galleryClient, /className="gallery-grid"/);
});

test("gallery room is a horizontal wall with floor and controls", () => {
  assert.match(galleryClient, /className="gallery-room"/);
  assert.match(galleryClient, /className="gallery-room__viewport" ref=\{roomViewportRef\}/);
  assert.match(galleryClient, /className="gallery-room__wall"/);
  assert.match(galleryClient, /className="gallery-room__floor"/);
  assert.match(galleryClient, /onClick=\{\(\) => scrollRoom\(-1\)\}/);
  assert.match(galleryClient, /onClick=\{\(\) => scrollRoom\(1\)\}/);
  assert.match(galleryClient, /viewport\.scrollBy\(\{/);
});

test("gallery room styling creates a wall, floor and responsive artwork rhythm", () => {
  assert.match(css, /\.gallery-room\s*\{[\s\S]*?min-height:\s*clamp\(520px,\s*64vh,\s*760px\);/);
  assert.match(css, /\.gallery-room::before\s*\{[\s\S]*?repeating-linear-gradient\(90deg,/);
  assert.match(css, /\.gallery-room__viewport\s*\{[\s\S]*?overflow-x:\s*auto;[\s\S]*?scroll-snap-type:\s*x mandatory;/);
  assert.match(css, /\.gallery-room__wall\s*\{[\s\S]*?display:\s*flex;[\s\S]*?min-width:\s*max-content;/);
  assert.match(css, /\.gallery-room__slot\s*\{[\s\S]*?scroll-snap-align:\s*center;/);
  assert.match(css, /\.gallery-room \.artwork-frame__window\s*\{[\s\S]*?height:\s*clamp\(300px,\s*32vw,\s*460px\);/);
  assert.match(css, /\.gallery-room__floor\s*\{[\s\S]*?clip-path:\s*polygon\(0 24%, 100% 0, 100% 100%, 0 100%\);/);
  assert.match(css, /\.gallery-room__nav--prev\s*\{[\s\S]*?left:\s*clamp\(16px,\s*2vw,\s*28px\);/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room__slot\s*\{[\s\S]*?flex-basis:\s*min\(72vw,\s*280px\);/);
});

test("dark mode keeps the gallery room consistent with the site atmosphere", () => {
  assert.match(css, /html\[data-theme="dark"\] \.gallery-room\s*\{[\s\S]*?linear-gradient\(180deg,\s*rgba\(24,\s*24,\s*22,\s*0\.96\)/);
  assert.match(css, /html\[data-theme="dark"\] \.gallery-room::before\s*\{[\s\S]*?repeating-linear-gradient\(90deg,/);
  assert.match(css, /html\[data-theme="dark"\] \.gallery-room__floor\s*\{[\s\S]*?linear-gradient\(180deg,\s*rgba\(94,\s*63,\s*38,\s*0\.68\)/);
});
