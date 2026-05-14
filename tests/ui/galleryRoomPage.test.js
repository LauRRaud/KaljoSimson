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
  assert.match(siteAmbient, /site-ambient--gallery-room/);
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
  assert.match(galleryClient, /const roomTravelDuration = 3200;/);
  assert.match(galleryClient, /function easeRoomScroll\(progress\)/);
  assert.match(galleryClient, /function animateRoomScrollTo\(target\)/);
  assert.match(galleryClient, /function getRoomSlots\(viewport\)/);
  assert.match(galleryClient, /function getCurrentRoomStartIndex\(viewport, slots, step\)/);
  assert.match(galleryClient, /function getRoomScrollTarget\(viewport, slots, startIndex\)/);
  assert.match(galleryClient, /focusLeft = viewportRect\.left \+ Number\.parseFloat\(viewportStyles\.paddingLeft \|\| "0"\)/);
  assert.match(galleryClient, /slots\[index\]\.getBoundingClientRect\(\)\.left - focusLeft/);
  assert.match(galleryClient, /window\.performance\.now\(\)/);
  assert.match(galleryClient, /roomTravelFrameRef\.current = window\.requestAnimationFrame\(step\);/);
  assert.match(galleryClient, /window\.cancelAnimationFrame\(roomTravelFrameRef\.current\)/);
  assert.match(galleryClient, /const slots = getRoomSlots\(viewport\);/);
  assert.match(galleryClient, /const scrollStep = getRoomScrollStep\(viewport, slots\);/);
  assert.match(galleryClient, /const currentStartIndex = getCurrentRoomStartIndex\(viewport, slots, scrollStep\);/);
  assert.match(galleryClient, /currentStartIndex \+ direction \* scrollStep/);
  assert.match(galleryClient, /getRoomScrollTarget\(viewport, slots, targetIndex\)/);
  assert.match(galleryClient, /animateRoomScrollTo\(targetScrollLeft\)/);
  assert.doesNotMatch(galleryClient, /artworkStep \* 0\.8/);
  assert.doesNotMatch(galleryClient, /behavior:\s*"smooth"/);
});

test("gallery room styling creates a clean wall and responsive artwork rhythm", () => {
  assert.match(css, /\.page-main--gallery\s*\{[\s\S]*?min-height:\s*100svh;/);
  assert.match(css, /\.gallery-room-page\s*\{[\s\S]*?min-height:\s*100svh;/);
  assert.match(css, /\.gallery-room-page__back\s*\{[\s\S]*?position:\s*absolute;/);
  assert.match(css, /\.gallery-room\s*\{[\s\S]*?min-height:\s*100svh;/);
  assert.match(css, /--gallery-room-slot:\s*clamp\(340px,\s*30vw,\s*540px\);/);
  assert.match(css, /--gallery-room-edge:\s*max\(/);
  assert.doesNotMatch(css, /\.gallery-room::before\s*\{[\s\S]*?repeating-linear-gradient\(90deg,/);
  assert.match(css, /\.gallery-room__viewport\s*\{[\s\S]*?min-height:\s*100svh;[\s\S]*?overflow-x:\s*auto;[\s\S]*?scroll-padding-inline:\s*var\(--gallery-room-edge\);/);
  assert.match(css, /\.gallery-room__wall\s*\{[\s\S]*?display:\s*flex;[\s\S]*?align-items:\s*flex-start;[\s\S]*?min-width:\s*max-content;/);
  assert.match(css, /\.gallery-room__slot\s*\{[\s\S]*?flex:\s*0 0 var\(--gallery-room-slot\);[\s\S]*?min-width:\s*0;/);
  assert.match(css, /\.gallery-room \.artwork-frame__window\s*\{[\s\S]*?width:\s*fit-content;[\s\S]*?height:\s*auto;/);
  assert.doesNotMatch(css, /\.gallery-room__floor\s*\{/);
  assert.match(css, /\.gallery-room__nav--prev\s*\{[\s\S]*?left:\s*clamp\(18px,\s*3vw,\s*44px\);/);
  assert.match(css, /\.gallery-room__nav\s*\{[\s\S]*?background:\s*var\(--glass-panel-bg\);[\s\S]*?box-shadow:\s*var\(--glass-panel-shadow\);/);
  assert.match(css, /\.gallery-room__nav:hover\s*\{[\s\S]*?background:\s*var\(--glass-panel-bg-strong\);[\s\S]*?color:\s*var\(--text\);/);
  assert.match(css, /\.gallery-room__nav span\s*\{[\s\S]*?border-top:\s*5px solid currentColor;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.page-main--gallery\s*\{[\s\S]*?padding-top:\s*0;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room\s*\{[\s\S]*?--gallery-room-mobile-slot:\s*min\(98vw,\s*430px\);/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room__viewport\s*\{[\s\S]*?calc\(\(100vw - var\(--gallery-room-mobile-slot\)\) \/ 2\)/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room__slot\s*\{[\s\S]*?flex-basis:\s*var\(--gallery-room-mobile-slot\);/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__image\s*\{[\s\S]*?max-height:\s*min\(80vw,\s*360px\);/);
  assert.match(css, /\.gallery-room \.artwork-frame__image\s*\{[\s\S]*?object-fit:\s*contain;/);
  assert.match(css, /\.gallery-room \.artwork-frame__caption-meta\s*\{[\s\S]*?display:\s*none;/);
  assert.match(css, /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.gallery-room__viewport\s*\{[\s\S]*?height:\s*auto;[\s\S]*?min-height:\s*0;[\s\S]*?padding-bottom:\s*14px;/);
  assert.match(css, /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.gallery-room__controls\s*\{[\s\S]*?position:\s*relative;[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*space-between;[\s\S]*?padding-inline:\s*clamp\(22px,\s*7vw,\s*36px\);/);
  assert.match(css, /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.gallery-room__nav\s*\{[\s\S]*?position:\s*static;[\s\S]*?top:\s*auto;[\s\S]*?bottom:\s*auto;/);
  assert.match(css, /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.gallery-room__nav--prev\s*\{[\s\S]*?left:\s*auto;/);
  assert.match(css, /@media \(max-height:\s*620px\) and \(orientation:\s*portrait\)\s*\{[\s\S]*?\.gallery-room__viewport\s*\{[\s\S]*?padding-top:\s*42px;[\s\S]*?padding-bottom:\s*10px;/);
  assert.match(css, /@media \(max-height:\s*620px\) and \(orientation:\s*portrait\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__image\s*\{[\s\S]*?max-height:\s*min\(46svh,\s*240px\);/);
  assert.match(css, /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?--gallery-room-slot:\s*min\(64vw,\s*620px\);/);
  assert.match(css, /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room__viewport\s*\{[\s\S]*?padding:\s*34px\s*calc\(\(100vw - var\(--gallery-room-slot\)\) \/ 2\)\s*18px;/);
  assert.match(css, /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__image\s*\{[\s\S]*?max-height:\s*min\(74svh,\s*calc\(var\(--gallery-room-slot\) \* 0\.58\)\);/);
});

test("dark mode keeps the gallery room consistent with the site atmosphere", () => {
  assert.match(css, /html\[data-theme="dark"\] \.gallery-room\s*\{[\s\S]*?rgba\(73,\s*72,\s*66,\s*0\.98\)/);
  assert.doesNotMatch(css, /html\[data-theme="dark"\] \.gallery-room::before\s*\{[\s\S]*?repeating-linear-gradient\(90deg,/);
  assert.doesNotMatch(css, /html\[data-theme="dark"\] \.gallery-room__floor\s*\{/);
});
