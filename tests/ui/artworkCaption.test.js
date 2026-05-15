const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const artworkFrame = readFileSync("src/components/ArtworkFrame.jsx", "utf8");
const galleryClient = readFileSync("src/components/GalleryClient.jsx", "utf8");

function getRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test("artwork captions show title, optional artist, year, and size in one centered row", () => {
  const captionRule = getRule(".artwork-frame__caption");
  const rowRule = getRule(".artwork-frame__caption p");
  const titleRule = getRule(".artwork-frame__caption p span:first-child");

  assert.match(captionRule, /align-items:\s*center;/);
  assert.match(captionRule, /text-align:\s*center;/);
  assert.match(rowRule, /display:\s*flex;/);
  assert.match(rowRule, /flex-wrap:\s*nowrap;/);
  assert.match(rowRule, /justify-content:\s*center;/);
  assert.match(rowRule, /white-space:\s*nowrap;/);
  assert.match(titleRule, /font-family:\s*var\(--font-display\);/);
  assert.doesNotMatch(artworkFrame, /<h3>/);
  assert.match(artworkFrame, /className="artwork-frame__caption-title"[\s\S]*?\{getCopy\(artwork\.title,\s*locale\)\}/);
  assert.match(artworkFrame, /artwork\.artistName \? \(/);
  assert.match(artworkFrame, /className="artwork-frame__caption-artist"[\s\S]*?\{artwork\.artistName\}/);
  assert.match(artworkFrame, /className="artwork-frame__caption-meta"[\s\S]*?\{getCaptionYear\(artwork\.year,\s*locale\)\}/);
  assert.match(artworkFrame, /className="artwork-frame__caption-meta"[\s\S]*?\{getCaptionSize\(artwork\.size,\s*locale\)\}/);
});

test("artist profile mobile gallery captions can wrap inside wider artwork cards", () => {
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.profile-hero \+ \.section\s*\{[\s\S]*?width:\s*calc\(100% \+ 32px\);[\s\S]*?margin-inline:\s*-16px;[\s\S]*?padding-inline:\s*18px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.profile-hero \+ \.section \.gallery-grid \.artwork-frame__window\s*\{[\s\S]*?height:\s*clamp\(300px,\s*72vw,\s*340px\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.profile-hero \+ \.section \.gallery-grid \.artwork-frame__caption p\s*\{[\s\S]*?flex-wrap:\s*wrap;[\s\S]*?overflow:\s*visible;[\s\S]*?white-space:\s*normal;/,
  );
});

test("gallery room captions stay on one visible row under artwork frames", () => {
  assert.match(
    css,
    /\.gallery-room \.artwork-frame__caption,\s*\.gallery-room \.artwork-frame__caption p\s*\{[\s\S]*?min-width:\s*0;/,
  );
  assert.match(
    css,
    /\.gallery-room \.artwork-frame__caption p\s*\{[\s\S]*?width:\s*max-content;[\s\S]*?max-width:\s*calc\(100vw - 32px\);[\s\S]*?flex-wrap:\s*wrap;[\s\S]*?overflow:\s*visible;[\s\S]*?white-space:\s*normal;/,
  );
  assert.match(
    css,
    /\.gallery-room \.artwork-frame__caption p span:first-child\s*\{[\s\S]*?flex:\s*0 1 auto;[\s\S]*?white-space:\s*nowrap;/,
  );
  assert.match(
    css,
    /\.gallery-room \.artwork-frame__caption p span\.artwork-frame__caption-artist\s*\{[\s\S]*?color:\s*var\(--artwork-caption-artist\);[\s\S]*?font-weight:\s*500;[\s\S]*?max-width:\s*100%;[\s\S]*?text-overflow:\s*clip;[\s\S]*?white-space:\s*nowrap;/,
  );
  assert.match(
    css,
    /\.gallery-room \.artwork-frame__caption-meta\s*\{[\s\S]*?display:\s*none;/,
  );
});

test("mobile gallery room captions show only full title and author", () => {
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__caption p\s*\{[\s\S]*?width:\s*max-content;[\s\S]*?max-width:\s*calc\(100vw - 28px\);[\s\S]*?flex-wrap:\s*nowrap;[\s\S]*?gap:\s*0 8px;[\s\S]*?overflow:\s*visible;[\s\S]*?white-space:\s*nowrap;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__caption p span:first-child\s*\{[\s\S]*?flex:\s*0 1 auto;[\s\S]*?font-size:\s*clamp\(1\.02rem,\s*4\.8vw,\s*1\.16rem\);[\s\S]*?text-overflow:\s*clip;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__caption p span\.artwork-frame__caption-artist\s*\{[\s\S]*?flex:\s*0 0 auto;[\s\S]*?max-width:\s*100%;[\s\S]*?color:\s*var\(--artwork-caption-artist\);[\s\S]*?font-weight:\s*500;[\s\S]*?font-size:\s*clamp\(0\.82rem,\s*3\.7vw,\s*0\.92rem\);[\s\S]*?text-overflow:\s*clip;[\s\S]*?white-space:\s*nowrap;/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.gallery-room__controls\s*\{[\s\S]*?position:\s*relative;[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*center;/,
  );
  assert.match(
    css,
    /@media \(orientation:\s*portrait\)\s*\{[\s\S]*?\.gallery-room__nav\s*\{[\s\S]*?position:\s*static;[\s\S]*?top:\s*auto;[\s\S]*?bottom:\s*auto;[\s\S]*?transform:\s*none;/,
  );
});

test("mobile landscape gallery room gives artwork more height with compact caption", () => {
  assert.match(
    css,
    /@media \(max-width:\s*1280px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room__viewport\s*\{[\s\S]*?padding:\s*[\s\S]*?34px[\s\S]*?18px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1280px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__image\s*\{[\s\S]*?max-height:\s*min\(74svh,\s*calc\(var\(--gallery-room-slot\) \* 0\.58\)\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1280px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__caption p\s*\{[\s\S]*?flex-wrap:\s*nowrap;[\s\S]*?white-space:\s*nowrap;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1280px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__caption p span:first-child\s*\{[\s\S]*?flex:\s*0 1 auto;[\s\S]*?font-size:\s*1\.1rem;/,
  );
});

test("gallery captions show label placeholders when artwork metadata is not confirmed", () => {
  assert.match(artworkFrame, /function getCaptionYear/);
  assert.match(artworkFrame, /return locale === "en" \? "Year" : "Aasta";/);
  assert.match(artworkFrame, /function getCaptionSize/);
  assert.match(artworkFrame, /return locale === "en" \? "Dimensions" : "Mõõtmed";/);
  assert.doesNotMatch(artworkFrame, /Dateerimata[\s\S]*<span>/);
  assert.match(artworkFrame, /className="artwork-frame__caption-meta"[\s\S]*?\{getCaptionYear\(artwork\.year,\s*locale\)\}/);
  assert.match(artworkFrame, /className="artwork-frame__caption-meta"[\s\S]*?\{getCaptionSize\(artwork\.size,\s*locale\)\}/);
});

test("artwork artist caption uses stronger contrast in both themes", () => {
  assert.match(css, /--artwork-caption-artist:\s*rgba\(24,\s*21,\s*18,\s*0\.82\);/);
  assert.match(
    css,
    /html\[data-theme="dark"\]\s*\{[\s\S]*?--artwork-caption-artist:\s*rgba\(245,\s*239,\s*229,\s*0\.84\);/,
  );
  assert.match(
    css,
    /\.gallery-grid \.artwork-frame__caption p span\.artwork-frame__caption-artist,\s*\.gallery-room \.artwork-frame__caption p span\.artwork-frame__caption-artist\s*\{[\s\S]*?color:\s*var\(--artwork-caption-artist\);[\s\S]*?font-weight:\s*500;/,
  );
});

test("artwork frames use one square active metallic frame in both themes", () => {
  const windowRule = getRule(".artwork-frame__window");
  const lightboxWindowRule = getRule(".lightbox__artwork-frame .artwork-frame__window");
  const mountRule = getRule(".artwork-frame__mount");
  const surfaceRule = getRule(".artwork-frame__surface");
  const surfaceShadowRule = getRule(".artwork-frame__surface::before");

  assert.match(
    css,
    /--frame-silver-metal:[\s\S]*?linear-gradient\(180deg,\s*rgba\(255,\s*255,\s*255,\s*0\.54\)[\s\S]*?linear-gradient\(90deg,[\s\S]*?linear-gradient\(180deg,\s*#edf2f3\s*0%,\s*#c8d1d7\s*43%,\s*#aeb9c2\s*100%/,
  );
  assert.match(css, /--frame-active-metal:\s*var\(--frame-silver-metal\);/);
  assert.match(css, /body\[data-frame-preset="gold"\],\s*\.page-shell\[data-frame-preset="gold"\]\s*\{[\s\S]*?--frame-active-metal:\s*var\(--frame-gold-metal\);/);
  assert.match(css, /body\[data-frame-preset="gold"\],\s*\.page-shell\[data-frame-preset="gold"\]\s*\{[\s\S]*?--frame-surface-ring:\s*rgba\(174,\s*136,\s*56,\s*0\.28\);/);
  assert.match(css, /body\[data-frame-preset="gold"\],\s*\.page-shell\[data-frame-preset="gold"\]\s*\{[\s\S]*?--frame-surface-ring-highlight:\s*rgba\(248,\s*226,\s*160,\s*0\.48\);/);
  assert.doesNotMatch(css, /rgba\(42,\s*50,\s*56,\s*0\.16\)/);
  assert.doesNotMatch(css, /#89939a/);
  assert.doesNotMatch(css, /#747b82/);
  assert.match(galleryClient, /<div className="gallery-grid">[\s\S]*?<ArtworkFrame/);
  assert.match(galleryClient, /<div className="lightbox__artwork-frame">[\s\S]*?<ArtworkFrame/);
  assert.doesNotMatch(lightboxWindowRule, /background:/);
  assert.match(windowRule, /background:\s*var\(--frame-active-metal\);/);
  assert.match(windowRule, /border-radius:\s*0;/);
  assert.match(windowRule, /border:\s*none;/);
  assert.match(
    windowRule,
    /box-shadow:\s*[\s\S]*?inset 10px 0 14px -15px rgba\(18,\s*24,\s*29,\s*0\.42\),[\s\S]*?inset 0 -12px 16px -15px rgba\(18,\s*24,\s*29,\s*0\.42\),[\s\S]*?var\(--artwork-object-shadow\);/,
  );
  assert.doesNotMatch(windowRule, /0 28px 32px -18px rgba\(75,\s*52,\s*28,\s*0\.34\)/);
  assert.match(
    css,
    /\.artwork-frame__window::before\s*\{[\s\S]*?linear-gradient\(180deg,\s*rgba\(42,\s*52,\s*60,\s*0\.08\),[\s\S]*?linear-gradient\(90deg,[\s\S]*?opacity:\s*0\.68;/,
  );
  assert.match(
    css,
    /body\[data-frame-preset="gold"\] \.artwork-frame__window::before,\s*\.page-shell\[data-frame-preset="gold"\] \.artwork-frame__window::before\s*\{[\s\S]*?rgba\(126,\s*91,\s*30,\s*0\.08\)[\s\S]*?opacity:\s*0\.56;/,
  );
  assert.match(
    css,
    /html\[data-theme="dark"\]\s+\.artwork-frame__window\s*\{[\s\S]*?inset 10px 0 14px -15px rgba\(0,\s*0,\s*0,\s*0\.52\),[\s\S]*?var\(--artwork-object-shadow\);/,
  );
  assert.match(
    css,
    /html\[data-theme="dark"\]\s+\.artwork-frame__window::before\s*\{[\s\S]*?linear-gradient\(180deg,\s*rgba\(255,\s*255,\s*255,\s*0\.08\),[\s\S]*?opacity:\s*0\.84;/,
  );
  assert.match(
    css,
    /html\[data-theme="dark"\]\s+\.artwork-frame__window::after\s*\{[\s\S]*?inset 0 0 0 1px var\(--frame-window-inner-line\),[\s\S]*?inset 0 0 0 2px var\(--frame-window-inner-highlight\)/,
  );
  assert.doesNotMatch(css, /linear-gradient\(118deg/);
  assert.doesNotMatch(css, /repeating-linear-gradient\(90deg/);
  assert.match(
    css,
    /\.artwork-frame__window::after\s*\{[\s\S]*?inset:\s*clamp\(10px,\s*0\.88vw,\s*13px\);[\s\S]*?inset 0 0 0 1px var\(--frame-window-inner-line\)[\s\S]*?inset 0 0 0 2px var\(--frame-window-inner-highlight\)/,
  );
  assert.doesNotMatch(css, /inset 0 -2px 6px/);
  assert.doesNotMatch(css, /inset 0 0 18px rgba\(50,\s*58,\s*64,\s*0\.28\)/);
  assert.doesNotMatch(css, /inset 0 0 30px rgba\(0,\s*0,\s*0,\s*0\.34\)/);
  assert.match(mountRule, /padding:\s*0;/);
  assert.match(mountRule, /border-radius:\s*0;/);
  assert.match(surfaceRule, /border-radius:\s*0;/);
  assert.match(surfaceShadowRule, /border-radius:\s*0;/);
  assert.match(
    surfaceShadowRule,
    /box-shadow:\s*[\s\S]*?inset 0 0 0 1px var\(--frame-surface-inner-line\),[\s\S]*?inset 10px 0 12px -13px var\(--frame-surface-inner-side-shadow\),[\s\S]*?inset 0 -10px 14px -13px var\(--frame-surface-inner-bottom-shadow\);/,
  );
  assert.match(
    surfaceShadowRule,
    /radial-gradient\(circle at 0 0,\s*var\(--frame-surface-corner-shadow\),\s*transparent 18%\)/,
  );
  assert.match(
    surfaceRule,
    /box-shadow:\s*[\s\S]*?0 0 0 clamp\(7px,\s*0\.7vw,\s*10px\) var\(--frame-surface-ring\),[\s\S]*?0 0 0 calc\(clamp\(7px,\s*0\.7vw,\s*10px\) \+ 1px\) var\(--frame-surface-ring-highlight\),[\s\S]*?0 2px 5px var\(--frame-surface-drop-shadow\);/,
  );
  assert.doesNotMatch(css, /\.artwork-frame__window--obsidian\s*\{[\s\S]*?background:/);
  assert.doesNotMatch(css, /\.artwork-frame__window--ivory\s*\{[\s\S]*?background:/);
  assert.doesNotMatch(css, /html\[data-theme="dark"\]\s+\.artwork-frame__window--obsidian/);
  assert.doesNotMatch(css, /html\[data-theme="dark"\]\s+\.artwork-frame__window--ivory/);
});
