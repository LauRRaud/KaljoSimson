const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const galleryClient = readFileSync("src/components/GalleryClient.jsx", "utf8");

test("lightbox keeps artwork navigation anchored in a fixed right panel", () => {
  assert.match(css, /--lightbox-panel-height:\s*min\(80vh,\s*800px\);/);
  assert.match(css, /--lightbox-detail-panel-height:\s*var\(--lightbox-panel-height\);/);
  assert.match(css, /width:\s*min\(1560px,\s*calc\(100vw\s*-\s*84px\)\);/);
  assert.match(css, /transform:\s*translateX\(clamp\(-150px,\s*-7vw,\s*-86px\)\);/);
  assert.match(
    css,
    /grid-template-columns:\s*minmax\(0,\s*1080px\)\s+clamp\(320px,\s*21vw,\s*380px\);/,
  );
  assert.match(css, /gap:\s*clamp\(28px,\s*2\.2vw,\s*44px\);/);
  assert.match(css, /align-items:\s*stretch;/);
  assert.match(css, /height:\s*var\(--lightbox-detail-panel-height\);/);
  assert.match(css, /margin-top:\s*auto;/);
});

test("lightbox close button lives inside the right panel and title stays restrained", () => {
  assert.match(
    galleryClient,
    /<aside className="lightbox__aside">[\s\S]*?<button[\s\S]*?className="lightbox__close"/,
  );
  assert.match(css, /\.lightbox__caption\s*\{[\s\S]*?width:\s*100%;[\s\S]*?padding-right:\s*0;/);
  assert.match(css, /\.lightbox__caption h2\s*\{[\s\S]*?max-width:\s*calc\(100% - 66px\);/);
  assert.match(css, /\.lightbox__caption \.inline-copy\s*\{[\s\S]*?max-width:\s*100%;/);
  assert.match(css, /\.lightbox__details\s*\{[\s\S]*?max-width:\s*100%;/);
  assert.match(css, /\.lightbox__close\s*\{[\s\S]*?width:\s*44px;[\s\S]*?background:\s*var\(--glass-control-bg\);[\s\S]*?box-shadow:\s*var\(--glass-control-shadow\);/);
  assert.match(css, /\.lightbox__close::before,\s*\.lightbox__close::after\s*\{[\s\S]*?width:\s*14px;[\s\S]*?height:\s*1\.5px;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.lightbox__close\s*\{[\s\S]*?position:\s*static;[\s\S]*?align-self:\s*flex-end;/);
  assert.match(css, /font-size:\s*clamp\(2\.2rem,\s*2\.75vw,\s*3\.1rem\);/);
  assert.match(css, /line-height:\s*1\.03;/);
});

test("lightbox presents artwork as a gallery wall with structured details", () => {
  assert.match(css, /\.lightbox__figure::before,\s*\.lightbox__figure::after\s*\{\s*display:\s*none;/);
  assert.match(galleryClient, /className=\{`lightbox__artwork-frame \$\{/);
  assert.match(galleryClient, /className="lightbox__artwork-image"/);
  assert.match(galleryClient, /<div className="lightbox__artwork-frame lightbox__artwork-frame--fallback">[\s\S]*?<ArtworkFrame/);
  assert.match(galleryClient, /<ArtworkFrame[\s\S]*?showCaption=\{false\}/);
  assert.match(css, /\.lightbox__artwork-frame\s*\{[\s\S]*?width:\s*fit-content;/);
  assert.match(css, /\.lightbox__artwork-frame\s*\{[\s\S]*?height:\s*var\(--lightbox-panel-height\);/);
  assert.match(css, /\.lightbox__image-window\s*\{[\s\S]*?justify-items:\s*end;/);
  assert.match(css, /\.lightbox__artwork-frame\s*\{[\s\S]*?transform:\s*none;/);
  assert.match(css, /\.lightbox__artwork-mount\s*\{[\s\S]*?padding:\s*0;/);
  assert.match(css, /\.lightbox__artwork-image\s*\{[\s\S]*?height:\s*calc\(var\(--lightbox-panel-height\) - clamp\(48px,\s*5\.8vh,\s*72px\)\);/);
  assert.match(css, /\.lightbox__artwork-image\s*\{[\s\S]*?max-height:\s*calc\(var\(--lightbox-panel-height\) - clamp\(48px,\s*5\.8vh,\s*72px\)\);/);
  assert.match(galleryClient, /<dl className="lightbox__details">/);
  assert.match(css, /\.lightbox__actions\s*\{[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*center;/);
  assert.match(css, /\.lightbox__nav-button\s*\{[\s\S]*?width:\s*clamp\(118px,\s*9vw,\s*138px\);/);
  assert.match(css, /--glass-control-shadow:\s*[\s\S]*?0 6px 12px rgba\(75,\s*52,\s*28,\s*0\.14\);/);
  assert.match(galleryClient, /<dt>\{locale === "en" \? "Year" : "Aasta"\}<\/dt>/);
  assert.match(galleryClient, /<dt>\{locale === "en" \? "Size" : "M.*dud"\}<\/dt>/);
});

test("dark mode lightbox keeps the gallery room dark", () => {
  assert.match(css, /html\[data-theme="dark"\] \.lightbox\s*\{[\s\S]*?rgba\(73,\s*72,\s*66,\s*0\.98\)/);
  assert.match(css, /\.lightbox::before,\s*\.lightbox::after\s*\{[\s\S]*?position:\s*fixed;/);
  assert.match(css, /\.lightbox__beam\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?top:\s*0;/);
  assert.match(css, /\.lightbox__image-window\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__image-window\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox::after\s*\{[\s\S]*?display:\s*none;[\s\S]*?background:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__artwork-frame,\s*html\[data-theme="dark"\] \.lightbox__artwork-frame--obsidian\s*\{[\s\S]*?linear-gradient\(180deg,\s*#fffaf1 0%,\s*#f0e7d9 38%,\s*#ded2bf 74%,\s*#f3eadf 100%\);/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__artwork-frame--ivory\s*\{[\s\S]*?linear-gradient\(180deg,\s*#5f5a54 0%,\s*#45413d 32%,\s*#2f3035 68%,\s*#24252a 100%\);/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__artwork-frame--ivory \.lightbox__artwork-mount\s*\{[\s\S]*?background:\s*transparent;/);
});

test("gallery artwork frames use a consistent visual footprint", () => {
  assert.match(css, /\.gallery-grid \.artwork-frame__window\s*\{[\s\S]*?height:\s*clamp\(300px,\s*25vw,\s*430px\);/);
  assert.match(css, /\.gallery-grid \.artwork-frame__mount,\s*\.gallery-grid \.artwork-frame__surface\s*\{[\s\S]*?height:\s*100%;/);
});
