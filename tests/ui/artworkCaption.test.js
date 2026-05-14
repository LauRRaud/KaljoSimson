const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const artworkFrame = readFileSync("src/components/ArtworkFrame.jsx", "utf8");

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
    /\.gallery-room \.artwork-frame__caption p span\.artwork-frame__caption-artist\s*\{[\s\S]*?max-width:\s*100%;[\s\S]*?text-overflow:\s*clip;[\s\S]*?white-space:\s*nowrap;/,
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
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__caption p span\.artwork-frame__caption-artist\s*\{[\s\S]*?flex:\s*0 0 auto;[\s\S]*?max-width:\s*100%;[\s\S]*?font-size:\s*clamp\(0\.82rem,\s*3\.7vw,\s*0\.92rem\);[\s\S]*?text-overflow:\s*clip;[\s\S]*?white-space:\s*nowrap;/,
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
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room__viewport\s*\{[\s\S]*?padding:\s*[\s\S]*?34px[\s\S]*?18px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__image\s*\{[\s\S]*?max-height:\s*min\(74svh,\s*calc\(var\(--gallery-room-slot\) \* 0\.58\)\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__caption p\s*\{[\s\S]*?flex-wrap:\s*nowrap;[\s\S]*?white-space:\s*nowrap;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*\{[\s\S]*?\.gallery-room \.artwork-frame__caption p span:first-child\s*\{[\s\S]*?flex:\s*0 1 auto;[\s\S]*?font-size:\s*1\.1rem;/,
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

test("artwork frame variants use light and dark wood grain", () => {
  const obsidianRule = getRule(".artwork-frame__window--obsidian");
  const ivoryRule = getRule(".artwork-frame__window--ivory");
  const mountRule = getRule(".artwork-frame__mount");

  assert.match(css, /--frame-light-wood:\s*[\s\S]*?#d9bd8c/);
  assert.doesNotMatch(css, /--frame-light-wood:\s*[\s\S]*?#d4a56a/);
  assert.match(css, /--frame-dark-wood:\s*[\s\S]*?#111111/);
  assert.doesNotMatch(css, /--frame-dark-wood:\s*[\s\S]*?#5a3722/);
  assert.doesNotMatch(css, /--frame-light-wood:\s*[\s\S]*?repeating-linear-gradient/);
  assert.doesNotMatch(css, /--frame-dark-wood:\s*[\s\S]*?repeating-linear-gradient/);
  assert.match(obsidianRule, /background:\s*var\(--frame-dark-wood\);/);
  assert.match(ivoryRule, /background:\s*var\(--frame-light-wood\);/);
  assert.match(mountRule, /padding:\s*0;/);
  assert.match(css, /html\[data-theme="dark"\]\s+\.artwork-frame__window--obsidian\s*\{[\s\S]*?background:\s*var\(--frame-light-wood\);/);
  assert.match(css, /html\[data-theme="dark"\]\s+\.artwork-frame__window--ivory\s*\{[\s\S]*?background:\s*var\(--frame-dark-wood\);/);
  assert.doesNotMatch(css, /linear-gradient\(180deg,\s*#5f5a54 0%,\s*#45413d 32%,\s*#2f3035 68%,\s*#24252a 100%\)/);
  assert.doesNotMatch(css, /linear-gradient\(180deg,\s*#fffaf1 0%,\s*#f0e7d9 38%,\s*#ded2bf 74%,\s*#f3eadf 100%\)/);
});
