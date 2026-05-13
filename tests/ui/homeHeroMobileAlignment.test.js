const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");

test("mobile home hero keeps title and copy in one centered column", () => {
  assert.doesNotMatch(css, /--home-tagline-shine/);
  assert.match(
    css,
    /:root\s*\{[\s\S]*?--home-tagline-text:\s*rgba\(24,\s*21,\s*18,\s*0\.68\);/,
  );
  assert.match(
    css,
    /html\[data-theme="dark"\]\s*\{[\s\S]*?--home-tagline-text:\s*rgba\(255,\s*248,\s*238,\s*0\.88\);/,
  );
  assert.match(
    css,
    /\.home-title__tagline-word\s*\{[\s\S]*?display:\s*inline-block;[\s\S]*?color:\s*inherit;[\s\S]*?opacity:\s*0;[\s\S]*?animation:\s*home-title-shine var\(--tagline-cycle-duration,\s*14\.8s\) linear infinite;[\s\S]*?animation-delay:\s*var\(--word-delay,\s*0s\);/,
  );
  assert.match(
    css,
    /@keyframes home-title-shine\s*\{[\s\S]*?0%\s*\{[\s\S]*?opacity:\s*0;[\s\S]*?5%\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?20%\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?24%\s*\{[\s\S]*?opacity:\s*0;[\s\S]*?100%\s*\{[\s\S]*?opacity:\s*0;/,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.home-title__tagline-word\s*\{[\s\S]*?animation:\s*none;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title\s*\{[\s\S]*?padding:\s*126px 0 48px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__inner\s*\{[\s\S]*?gap:\s*0;[\s\S]*?width:\s*100vw;[\s\S]*?margin:\s*0 calc\(50% - 50vw\) 0;[\s\S]*?padding:\s*0;[\s\S]*?align-items:\s*center;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__brand\s*\{[\s\S]*?width:\s*min\(calc\(100vw - 44px\),\s*350px\);[\s\S]*?margin:\s*0 auto;[\s\S]*?font-size:\s*clamp\(3\.3rem,\s*14\.6vw,\s*5\.1rem\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__brand\s*\{[\s\S]*?line-height:\s*0\.98;[\s\S]*?\.home-title__brand-word\s*\{[\s\S]*?display:\s*block;[\s\S]*?width:\s*fit-content;[\s\S]*?margin-inline:\s*auto;[\s\S]*?\.home-title__brand-word:first-child\s*\{[\s\S]*?transform:\s*translateX\(calc\(-1 \* clamp\(46px,\s*14vw,\s*60px\)\)\);[\s\S]*?\.home-title__brand-word \+ \.home-title__brand-word\s*\{[\s\S]*?transform:\s*translateX\(clamp\(46px,\s*14vw,\s*60px\)\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__tagline\s*\{[\s\S]*?margin-top:\s*48px;[\s\S]*?font-size:\s*clamp\(1\.2rem,\s*5\.2vw,\s*1\.42rem\);[\s\S]*?justify-content:\s*center;[\s\S]*?letter-spacing:\s*0\.14em;[\s\S]*?max-width:\s*min\(calc\(100vw - 48px\),\s*340px\);[\s\S]*?\.home-title__tagline-word\s*\{[\s\S]*?animation-duration:\s*var\(--tagline-mobile-cycle-duration,\s*14\.8s\);[\s\S]*?animation-delay:\s*var\(--word-mobile-delay,\s*0s\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__story\s*\{[\s\S]*?width:\s*100%;[\s\S]*?justify-content:\s*center;[\s\S]*?margin-top:\s*58px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__copy\s*\{[\s\S]*?width:\s*min\(calc\(100vw - 48px\),\s*34ch\);[\s\S]*?max-width:\s*none;[\s\S]*?margin:\s*0 auto;[\s\S]*?font-size:\s*1\.08rem;[\s\S]*?text-align:\s*center;/,
  );
});
