const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const galleryClient = readFileSync("src/components/GalleryClient.jsx", "utf8");

test("lightbox keeps artwork navigation anchored in a fixed right panel", () => {
  assert.match(css, /--lightbox-panel-height:\s*min\(74vh,\s*720px\);/);
  assert.match(css, /width:\s*min\(1360px,\s*calc\(100vw\s*-\s*96px\)\);/);
  assert.match(
    css,
    /grid-template-columns:\s*minmax\(0,\s*900px\)\s+clamp\(340px,\s*24vw,\s*420px\);/,
  );
  assert.match(css, /align-items:\s*stretch;/);
  assert.match(css, /height:\s*var\(--lightbox-panel-height\);/);
  assert.match(css, /margin-top:\s*auto;/);
});

test("lightbox close button lives inside the right panel and title stays restrained", () => {
  assert.match(
    galleryClient,
    /<aside className="lightbox__aside">[\s\S]*?<button[\s\S]*?className="lightbox__close"/,
  );
  assert.match(css, /font-size:\s*clamp\(1\.85rem,\s*2\.35vw,\s*2\.8rem\);/);
  assert.match(css, /line-height:\s*1\.03;/);
});

test("lightbox presents artwork as a gallery wall with structured details", () => {
  assert.match(css, /\.lightbox__figure::before,\s*\.lightbox__figure::after\s*\{\s*display:\s*none;/);
  assert.match(galleryClient, /className=\{`lightbox__artwork-frame \$\{/);
  assert.match(galleryClient, /className="lightbox__artwork-image"/);
  assert.match(galleryClient, /<div className="lightbox__artwork-frame lightbox__artwork-frame--fallback">[\s\S]*?<ArtworkFrame/);
  assert.match(galleryClient, /<ArtworkFrame[\s\S]*?showCaption=\{false\}/);
  assert.match(css, /\.lightbox__artwork-frame\s*\{[\s\S]*?width:\s*fit-content;/);
  assert.match(css, /\.lightbox__artwork-image\s*\{[\s\S]*?max-height:\s*calc\(var\(--lightbox-panel-height\) - clamp\(134px,\s*18vh,\s*204px\)\);/);
  assert.match(galleryClient, /<dl className="lightbox__details">/);
  assert.match(galleryClient, /<dt>\{locale === "en" \? "Year" : "Aasta"\}<\/dt>/);
  assert.match(galleryClient, /<dt>\{locale === "en" \? "Size" : "M.*dud"\}<\/dt>/);
});

test("dark mode lightbox keeps the gallery room dark", () => {
  assert.match(css, /html\[data-theme="dark"\] \.lightbox\s*\{[\s\S]*?linear-gradient\(180deg,\s*#101113 0%,\s*#090a0c 58%,\s*#050608 100%\);/);
  assert.match(css, /\.lightbox::before,\s*\.lightbox::after\s*\{[\s\S]*?position:\s*fixed;/);
  assert.match(css, /\.lightbox__beam\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?top:\s*0;/);
  assert.match(css, /\.lightbox__image-window\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__image-window\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__artwork-frame\s*\{[\s\S]*?linear-gradient\(145deg,\s*#4b4842 0%,\s*#292826 22%,\s*#111217 62%,\s*#1f2022 100%\);/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__artwork-mount\s*\{[\s\S]*?#101114;/);
});

test("gallery artwork frames use a consistent visual footprint", () => {
  assert.match(css, /\.gallery-grid \.artwork-frame__window\s*\{[\s\S]*?height:\s*clamp\(300px,\s*25vw,\s*430px\);/);
  assert.match(css, /\.gallery-grid \.artwork-frame__mount,\s*\.gallery-grid \.artwork-frame__surface\s*\{[\s\S]*?height:\s*100%;/);
});
