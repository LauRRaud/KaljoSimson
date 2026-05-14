const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const galleryClient = readFileSync("src/components/GalleryClient.jsx", "utf8");

test("lightbox keeps artwork navigation anchored in a fixed right panel", () => {
  assert.match(css, /--lightbox-panel-height:\s*min\(80vh,\s*800px\);/);
  assert.match(css, /--lightbox-detail-panel-height:\s*clamp\(430px,\s*56vh,\s*560px\);/);
  assert.match(css, /width:\s*min\(1640px,\s*calc\(100vw\s*-\s*84px\)\);/);
  assert.match(css, /transform:\s*translateX\(clamp\(-190px,\s*-8vw,\s*-108px\)\);/);
  assert.match(
    css,
    /grid-template-columns:\s*minmax\(0,\s*1040px\)\s+clamp\(340px,\s*24vw,\s*430px\);/,
  );
  assert.match(css, /gap:\s*clamp\(28px,\s*2\.2vw,\s*44px\);/);
  assert.match(css, /align-items:\s*stretch;/);
  assert.match(css, /\.lightbox__aside\s*\{[\s\S]*?align-self:\s*center;/);
  assert.match(css, /height:\s*var\(--lightbox-detail-panel-height\);/);
  assert.match(css, /margin-top:\s*auto;/);
});

test("lightbox close button lives inside the right panel and title stays restrained", () => {
  assert.match(
    galleryClient,
    /<aside className="lightbox__aside">[\s\S]*?<button[\s\S]*?className="lightbox__close"/,
  );
  assert.match(css, /\.lightbox__caption\s*\{[\s\S]*?width:\s*100%;[\s\S]*?padding-right:\s*0;/);
  assert.match(css, /\.lightbox__caption h2\s*\{[\s\S]*?max-width:\s*calc\(100% - 54px\);/);
  assert.match(css, /\.lightbox__caption \.inline-copy\s*\{[\s\S]*?max-width:\s*100%;/);
  assert.match(css, /\.lightbox__details\s*\{[\s\S]*?max-width:\s*100%;/);
  assert.match(css, /\.lightbox__aside\s*\{[\s\S]*?overflow:\s*hidden;/);
  assert.match(css, /\.lightbox__aside\s*\{[\s\S]*?scrollbar-width:\s*none;/);
  assert.match(css, /\.lightbox__aside::-webkit-scrollbar\s*\{[\s\S]*?display:\s*none;/);
  assert.match(css, /\.lightbox__close\s*\{[\s\S]*?width:\s*36px;[\s\S]*?background:\s*rgba\(255,\s*252,\s*246,\s*0\.08\);[\s\S]*?box-shadow:\s*inset 0 0 0 1px rgba\(255,\s*255,\s*255,\s*0\.16\);/);
  assert.match(css, /\.lightbox__close::before,\s*\.lightbox__close::after\s*\{[\s\S]*?width:\s*17px;[\s\S]*?height:\s*1\.5px;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.lightbox__close\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?top:\s*14px;[\s\S]*?right:\s*14px;[\s\S]*?align-self:\s*auto;/);
  assert.match(css, /font-size:\s*clamp\(1\.95rem,\s*2\.3vw,\s*2\.65rem\);/);
  assert.match(css, /line-height:\s*1\.02;/);
  assert.match(css, /\.lightbox__caption \.inline-copy\s*\{[\s\S]*?font-size:\s*clamp\(1rem,\s*1\.1vw,\s*1\.16rem\);/);
});

test("lightbox presents artwork as a gallery wall with structured details", () => {
  assert.match(css, /\.lightbox__figure::before,\s*\.lightbox__figure::after\s*\{\s*display:\s*none;/);
  assert.match(galleryClient, /<div className="lightbox__artwork-frame">[\s\S]*?<ArtworkFrame/);
  assert.match(galleryClient, /<ArtworkFrame[\s\S]*?showCaption=\{false\}/);
  assert.match(css, /\.lightbox__artwork-frame\s*\{[\s\S]*?width:\s*min\(820px,\s*calc\(100% - clamp\(36px,\s*7vw,\s*112px\)\)\);/);
  assert.match(css, /\.lightbox__artwork-frame \.artwork-frame__window\s*\{[\s\S]*?height:\s*calc\(var\(--lightbox-panel-height\) - clamp\(90px,\s*13vh,\s*150px\)\);/);
  assert.match(css, /\.lightbox__image-window\s*\{[\s\S]*?justify-items:\s*end;/);
  assert.match(css, /\.lightbox__artwork-frame\s*\{[\s\S]*?transform:\s*none;/);
  assert.match(css, /\.lightbox__artwork-frame \.artwork-frame__mount,\s*\.lightbox__artwork-frame \.artwork-frame__surface\s*\{[\s\S]*?height:\s*100%;[\s\S]*?width:\s*100%;/);
  assert.match(css, /\.lightbox__image,\s*\.lightbox__artwork-frame \.artwork-frame__image\s*\{[\s\S]*?max-height:\s*100%;/);
  assert.match(galleryClient, /<dl className="lightbox__details">/);
  assert.match(galleryClient, /lightbox__details-row--\$\{item\.key\}/);
  assert.match(css, /\.lightbox__actions\s*\{[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*center;[\s\S]*?width:\s*fit-content;/);
  assert.match(css, /\.lightbox__nav-button\s*\{[\s\S]*?width:\s*auto;[\s\S]*?padding:\s*0 17px;/);
  assert.match(css, /--glass-control-shadow:\s*[\s\S]*?0 6px 12px rgba\(75,\s*52,\s*28,\s*0\.14\);/);
  assert.match(galleryClient, /function compactMetaValue/);
  assert.match(galleryClient, /function renderMetaValue/);
  assert.match(galleryClient, /const artworkMeta = activeArtwork/);
  assert.match(galleryClient, /key:\s*"medium"[\s\S]*?key:\s*"year"[\s\S]*?key:\s*"size"/);
  assert.doesNotMatch(galleryClient, /\.filter\(\(item\) => item\.value\)/);
  assert.match(galleryClient, /<dt>\{item\.label\}<\/dt>/);
  assert.match(galleryClient, /<dd>\{item\.value\}<\/dd>/);
});

test("dark mode lightbox keeps the gallery room dark", () => {
  assert.match(css, /html\[data-theme="dark"\] \.lightbox\s*\{[\s\S]*?rgba\(73,\s*72,\s*66,\s*0\.98\)/);
  assert.match(css, /\.lightbox::before,\s*\.lightbox::after\s*\{[\s\S]*?position:\s*fixed;/);
  assert.match(css, /\.lightbox__beam\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?top:\s*0;/);
  assert.match(css, /\.lightbox__image-window\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__image-window\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox::after\s*\{[\s\S]*?display:\s*none;[\s\S]*?background:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__artwork-frame\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__artwork-frame \.artwork-frame__mount\s*\{[\s\S]*?padding:\s*0;[\s\S]*?background:\s*transparent;/);
});

test("mobile lightbox gives portrait artwork more room and keeps landscape balanced", () => {
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.lightbox__sheet\s*\{[\s\S]*?--lightbox-panel-height:\s*min\(44vh,\s*360px\);[\s\S]*?--lightbox-panel-min-height:\s*278px;[\s\S]*?width:\s*calc\(100vw - 16px\);/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.lightbox__artwork-frame\s*\{[\s\S]*?width:\s*min\(100%,\s*calc\(\(var\(--lightbox-panel-height\) - 8px\) \* 1\.28\)\);[\s\S]*?height:\s*calc\(var\(--lightbox-panel-height\) - 8px\);/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.lightbox__aside\s*\{[\s\S]*?gap:\s*8px;[\s\S]*?padding:\s*14px 20px 16px;/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.lightbox__caption\s*\{[\s\S]*?padding-top:\s*4px;/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.lightbox__caption \.eyebrow\s*\{[\s\S]*?margin-bottom:\s*10px;/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.lightbox__details\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.lightbox__details-row--medium\s*\{[\s\S]*?grid-column:\s*1 \/ -1;/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*calc\(var\(--lightbox-panel-height\) \* 1\.34\)\)\s*clamp\(254px,\s*25vw,\s*292px\);[\s\S]*?gap:\s*clamp\(14px,\s*1\.8vw,\s*24px\);[\s\S]*?transform:\s*translateX\(clamp\(14px,\s*3vw,\s*34px\)\);/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__sheet\s*\{[\s\S]*?--lightbox-panel-height:\s*min\(88svh,\s*400px\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*calc\(var\(--lightbox-panel-height\) \* 1\.34\)\)\s*clamp\(254px,\s*25vw,\s*292px\);[\s\S]*?gap:\s*clamp\(14px,\s*1\.8vw,\s*24px\);[\s\S]*?transform:\s*translateX\(clamp\(14px,\s*3vw,\s*34px\)\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__aside\s*\{[\s\S]*?overflow-y:\s*auto;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__caption\s*\{[\s\S]*?flex:\s*0 0 auto;[\s\S]*?min-height:\s*auto;[\s\S]*?padding-top:\s*0;[\s\S]*?padding-right:\s*10px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__details\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-direction:\s*column;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__details\s*\{[\s\S]*?gap:\s*2px;[\s\S]*?line-height:\s*1\.08;[\s\S]*?margin-top:\s*4px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__details div\s*\{[\s\S]*?display:\s*flex;[\s\S]*?gap:\s*8px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__details dd\s*\{[\s\S]*?display:\s*block;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__caption \.eyebrow\s*\{[\s\S]*?font-size:\s*1rem;[\s\S]*?\.lightbox__caption h2\s*\{[\s\S]*?font-size:\s*clamp\(1\.52rem,\s*4vw,\s*1\.84rem\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__nav-button\s*\{[\s\S]*?min-height:\s*32px;[\s\S]*?font-size:\s*0\.84rem;/,
  );
});

test("gallery artwork frames use a consistent visual footprint", () => {
  assert.match(css, /\.gallery-grid \.artwork-frame__window\s*\{[\s\S]*?height:\s*clamp\(300px,\s*25vw,\s*430px\);/);
  assert.match(css, /\.gallery-grid \.artwork-frame__mount,\s*\.gallery-grid \.artwork-frame__surface\s*\{[\s\S]*?height:\s*100%;/);
});
