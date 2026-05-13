const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const galleryClient = readFileSync("src/components/GalleryClient.jsx", "utf8");

test("lightbox keeps artwork navigation anchored in a fixed right panel", () => {
  assert.match(css, /--lightbox-panel-height:\s*min\(80vh,\s*800px\);/);
  assert.match(css, /--lightbox-detail-panel-height:\s*var\(--lightbox-panel-height\);/);
  assert.match(css, /width:\s*min\(1640px,\s*calc\(100vw\s*-\s*84px\)\);/);
  assert.match(css, /transform:\s*translateX\(clamp\(-190px,\s*-8vw,\s*-108px\)\);/);
  assert.match(
    css,
    /grid-template-columns:\s*minmax\(0,\s*1040px\)\s+clamp\(390px,\s*27vw,\s*500px\);/,
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
  assert.match(css, /\.lightbox__aside\s*\{[\s\S]*?overflow:\s*hidden;/);
  assert.match(css, /\.lightbox__close\s*\{[\s\S]*?width:\s*36px;[\s\S]*?background:\s*rgba\(255,\s*252,\s*246,\s*0\.08\);[\s\S]*?box-shadow:\s*inset 0 0 0 1px rgba\(255,\s*255,\s*255,\s*0\.16\);/);
  assert.match(css, /\.lightbox__close::before,\s*\.lightbox__close::after\s*\{[\s\S]*?width:\s*13px;[\s\S]*?height:\s*2px;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.lightbox__close\s*\{[\s\S]*?position:\s*static;[\s\S]*?align-self:\s*flex-end;/);
  assert.match(css, /font-size:\s*clamp\(1\.95rem,\s*2\.3vw,\s*2\.65rem\);/);
  assert.match(css, /line-height:\s*1\.02;/);
  assert.match(css, /\.lightbox__caption \.inline-copy\s*\{[\s\S]*?font-size:\s*clamp\(1rem,\s*1\.1vw,\s*1\.16rem\);/);
});

test("lightbox presents artwork as a gallery wall with structured details", () => {
  assert.match(css, /\.lightbox__figure::before,\s*\.lightbox__figure::after\s*\{\s*display:\s*none;/);
  assert.match(galleryClient, /className=\{`lightbox__artwork-frame \$\{/);
  assert.match(galleryClient, /className="lightbox__artwork-image"/);
  assert.match(galleryClient, /<div className="lightbox__artwork-frame lightbox__artwork-frame--fallback">[\s\S]*?<ArtworkFrame/);
  assert.match(galleryClient, /<ArtworkFrame[\s\S]*?showCaption=\{false\}/);
  assert.match(css, /\.lightbox__artwork-frame\s*\{[\s\S]*?width:\s*min\(100%,\s*calc\(\(var\(--lightbox-panel-height\) - clamp\(16px,\s*2vh,\s*28px\)\) \* 1\.28\)\);/);
  assert.match(css, /\.lightbox__artwork-frame\s*\{[\s\S]*?height:\s*calc\(var\(--lightbox-panel-height\) - clamp\(16px,\s*2vh,\s*28px\)\);/);
  assert.match(css, /\.lightbox__image-window\s*\{[\s\S]*?justify-items:\s*end;/);
  assert.match(css, /\.lightbox__artwork-frame\s*\{[\s\S]*?transform:\s*none;/);
  assert.match(css, /\.lightbox__artwork-mount\s*\{[\s\S]*?padding:\s*0;/);
  assert.match(css, /\.lightbox__artwork-mount\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;/);
  assert.match(css, /\.lightbox__artwork-image\s*\{[\s\S]*?height:\s*100%;[\s\S]*?object-fit:\s*cover;/);
  assert.match(galleryClient, /<dl className="lightbox__details">/);
  assert.match(css, /\.lightbox__actions\s*\{[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*center;[\s\S]*?width:\s*fit-content;/);
  assert.match(css, /\.lightbox__nav-button\s*\{[\s\S]*?width:\s*auto;[\s\S]*?padding:\s*0 17px;/);
  assert.match(css, /--glass-control-shadow:\s*[\s\S]*?0 6px 12px rgba\(75,\s*52,\s*28,\s*0\.14\);/);
  assert.match(galleryClient, /function compactMetaValue/);
  assert.match(galleryClient, /<dt>\{yearLabel\}<\/dt>/);
  assert.match(galleryClient, /<dt>\{mediumLabel\}<\/dt>/);
  assert.match(galleryClient, /<dt>\{sizeLabel\}<\/dt>/);
});

test("dark mode lightbox keeps the gallery room dark", () => {
  assert.match(css, /html\[data-theme="dark"\] \.lightbox\s*\{[\s\S]*?rgba\(73,\s*72,\s*66,\s*0\.98\)/);
  assert.match(css, /\.lightbox::before,\s*\.lightbox::after\s*\{[\s\S]*?position:\s*fixed;/);
  assert.match(css, /\.lightbox__beam\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?top:\s*0;/);
  assert.match(css, /\.lightbox__image-window\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__image-window\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox::after\s*\{[\s\S]*?display:\s*none;[\s\S]*?background:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__artwork-frame,\s*html\[data-theme="dark"\] \.lightbox__artwork-frame--obsidian\s*\{[\s\S]*?background:\s*var\(--frame-light-wood\);/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__artwork-frame--ivory\s*\{[\s\S]*?background:\s*var\(--frame-dark-wood\);/);
  assert.match(css, /html\[data-theme="dark"\] \.lightbox__artwork-frame--ivory \.lightbox__artwork-mount\s*\{[\s\S]*?background:\s*transparent;/);
});

test("mobile lightbox gives portrait artwork more room and keeps landscape balanced", () => {
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.lightbox__sheet\s*\{[\s\S]*?--lightbox-panel-height:\s*min\(44vh,\s*360px\);[\s\S]*?--lightbox-panel-min-height:\s*278px;[\s\S]*?width:\s*calc\(100vw - 16px\);/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.lightbox__artwork-frame\s*\{[\s\S]*?width:\s*min\(100%,\s*calc\(\(var\(--lightbox-panel-height\) - 12px\) \* 1\.28\)\);[\s\S]*?height:\s*calc\(var\(--lightbox-panel-height\) - 12px\);/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.lightbox__artwork-frame\s*\{[\s\S]*?padding:\s*14px;/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\) clamp\(300px,\s*34vw,\s*340px\);/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__sheet\s*\{[\s\S]*?--lightbox-panel-height:\s*min\(86svh,\s*380px\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\) clamp\(300px,\s*34vw,\s*340px\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__aside\s*\{[\s\S]*?overflow-y:\s*auto;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__caption\s*\{[\s\S]*?flex:\s*0 0 auto;[\s\S]*?min-height:\s*auto;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__details\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-direction:\s*column;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__details div\s*\{[\s\S]*?display:\s*flex;[\s\S]*?gap:\s*6px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__details dd\s*\{[\s\S]*?display:\s*none;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__caption h2\s*\{[\s\S]*?font-size:\s*clamp\(1\.42rem,\s*4\.2vw,\s*1\.78rem\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.lightbox__nav-button\s*\{[\s\S]*?min-height:\s*30px;[\s\S]*?font-size:\s*0\.8rem;/,
  );
});

test("gallery artwork frames use a consistent visual footprint", () => {
  assert.match(css, /\.gallery-grid \.artwork-frame__window\s*\{[\s\S]*?height:\s*clamp\(300px,\s*25vw,\s*430px\);/);
  assert.match(css, /\.gallery-grid \.artwork-frame__mount,\s*\.gallery-grid \.artwork-frame__surface\s*\{[\s\S]*?height:\s*100%;/);
});
