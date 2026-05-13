const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const galleryPage = readFileSync("src/app/gallery/page.js", "utf8");
const galleryClient = readFileSync("src/components/GalleryClient.jsx", "utf8");
const siteAmbient = readFileSync("src/components/SiteAmbient.jsx", "utf8");

test("public gallery page uses the room variant without changing artist galleries", () => {
  assert.match(galleryPage, /mainClassName="page-main--gallery"/);
  assert.match(galleryPage, /showFooter=\{false\}/);
  assert.match(siteAmbient, /pathname === "\/gallery"/);
  assert.match(siteAmbient, /if \(isGalleryRoom\) \{[\s\S]*?return null;/);
  assert.match(galleryPage, /className="gallery-room-page"/);
  assert.match(galleryPage, /className="gallery-room-page__back inline-link"/);
  assert.match(galleryPage, /locale === "en" \? "Back" : "Tagasi"/);
  assert.doesNotMatch(galleryPage, /Back to homepage|Tagasi avalehele/);
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
  assert.match(galleryClient, /const artworkStep = slotWidth \+ gap;/);
  assert.match(galleryClient, /const pairStep = artworkStep \* 2;/);
  assert.match(galleryClient, /max-width:\s*1100px[\s\S]*orientation:\s*landscape/);
});

test("gallery room styling creates a clean wall and responsive artwork rhythm", () => {
  assert.match(css, /\.page-main--gallery\s*\{[\s\S]*?min-height:\s*100svh;/);
  assert.match(css, /\.gallery-room-page\s*\{[\s\S]*?min-height:\s*100svh;/);
  assert.match(css, /\.gallery-room-page__back\s*\{[\s\S]*?position:\s*absolute;/);
  assert.match(css, /\.gallery-room\s*\{[\s\S]*?min-height:\s*100svh;/);
  assert.match(css, /--gallery-room-slot:\s*clamp\(340px,\s*30vw,\s*540px\);/);
  assert.match(css, /--gallery-room-edge:\s*max\(/);
  assert.doesNotMatch(css, /\.gallery-room::before\s*\{[\s\S]*?repeating-linear-gradient\(90deg,/);
  assert.match(css, /\.gallery-room__viewport\s*\{[\s\S]*?min-height:\s*100svh;[\s\S]*?overflow-x:\s*auto;[\s\S]*?scroll-snap-type:\s*x mandatory;/);
  assert.match(css, /\.gallery-room__wall\s*\{[\s\S]*?display:\s*flex;[\s\S]*?align-items:\s*flex-start;[\s\S]*?min-width:\s*max-content;/);
  assert.match(css, /\.gallery-room__slot\s*\{[\s\S]*?scroll-snap-align:\s*center;/);
  assert.match(css, /\.gallery-room \.artwork-frame__window\s*\{[\s\S]*?height:\s*clamp\(286px,\s*23vw,\s*410px\);/);
  assert.doesNotMatch(css, /\.gallery-room__floor\s*\{/);
  assert.match(css, /\.gallery-room__nav--prev\s*\{[\s\S]*?left:\s*clamp\(18px,\s*3vw,\s*44px\);/);
  assert.match(css, /\.gallery-room__nav span\s*\{[\s\S]*?border-top:\s*5px solid currentColor;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.page-main--gallery\s*\{[\s\S]*?padding-top:\s*0;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room\s*\{[\s\S]*?--gallery-room-mobile-slot:\s*min\(88vw,\s*350px\);/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room__viewport\s*\{[\s\S]*?calc\(\(100vw - var\(--gallery-room-mobile-slot\)\) \/ 2\)/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room__slot\s*\{[\s\S]*?flex-basis:\s*var\(--gallery-room-mobile-slot\);/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__window\s*\{[\s\S]*?height:\s*min\(68vw,\s*300px\);/);
  assert.match(css, /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.gallery-room__nav\s*\{[\s\S]*?top:\s*calc\(50% \+ clamp\(132px,\s*20svh,\s*154px\)\);[\s\S]*?bottom:\s*auto;/);
  assert.match(css, /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.gallery-room__nav--prev\s*\{[\s\S]*?left:\s*calc\(50% - 138px\);/);
  assert.match(css, /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?--gallery-room-slot:\s*min\(56vw,\s*540px\);/);
  assert.match(css, /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room__viewport\s*\{[\s\S]*?padding-inline:\s*calc\(\(100vw - var\(--gallery-room-slot\)\) \/ 2\);/);
  assert.match(css, /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__window\s*\{[\s\S]*?height:\s*min\(72svh,\s*calc\(var\(--gallery-room-slot\) \* 0\.72\)\);/);
});

test("dark mode keeps the gallery room consistent with the site atmosphere", () => {
  assert.match(css, /html\[data-theme="dark"\] \.gallery-room\s*\{[\s\S]*?rgba\(73,\s*72,\s*66,\s*0\.98\)/);
  assert.doesNotMatch(css, /html\[data-theme="dark"\] \.gallery-room::before\s*\{[\s\S]*?repeating-linear-gradient\(90deg,/);
  assert.doesNotMatch(css, /html\[data-theme="dark"\] \.gallery-room__floor\s*\{/);
});
