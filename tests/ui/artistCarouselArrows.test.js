const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");
const carousel = readFileSync("src/components/HomeArtistCarousel.jsx", "utf8");

function getRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

function getTopLevelRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`(?:^|\\n)${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `Missing top-level CSS rule for ${selector}`);
  return match[1];
}

function getRules(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...css.matchAll(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`, "g"))];
  assert.ok(matches.length > 0, `Missing CSS rule for ${selector}`);
  return matches.map((match) => match[1]).join("\n");
}

function getArrowButtonBlock(direction) {
  const match = carousel.match(
    new RegExp(`className="artist-stage__arrow artist-stage__arrow--${direction}"[\\s\\S]*?<\\/button>`),
  );
  assert.ok(match, `Missing ${direction} carousel arrow button`);
  return match[0];
}

test("artist carousel arrows stay near the screen edge with a soft hover treatment", () => {
  const baseRule = getRule(".artist-stage__arrow");
  const hoverRule = getRule(".artist-stage__arrow:hover");
  const arrowGlyphRule = getRule(".artist-stage__arrow span");
  const leftRule = getRule(".artist-stage__arrow--left");
  const rightRule = getRule(".artist-stage__arrow--right");

  assert.match(baseRule, /top:\s*34%;/);
  assert.match(baseRule, /bottom:\s*auto;/);
  assert.match(baseRule, /width:\s*76px;/);
  assert.match(baseRule, /height:\s*76px;/);
  assert.doesNotMatch(baseRule, /inset\s+0\s+1px/);
  assert.match(hoverRule, /background:\s*rgba\(255,\s*252,\s*246,\s*0\.78\);/);
  assert.match(hoverRule, /color:\s*rgba\(24,\s*21,\s*18,\s*0\.76\);/);
  assert.match(hoverRule, /transform:\s*translateY\(-50%\);/);
  assert.match(arrowGlyphRule, /border-radius:\s*3px;/);
  assert.match(leftRule, /left:\s*clamp\(4px,\s*2\.4vw,\s*28px\);/);
  assert.match(rightRule, /right:\s*clamp\(4px,\s*2\.4vw,\s*28px\);/);
});

test("artist carousel cards center short metadata while keeping bio left aligned", () => {
  const cardRule = getRules(".artist-card--carousel");
  const buttonCardRule = getRules(".artist-card:is(button).artist-card--carousel");
  const metaRule = getRules(".artist-card--carousel .artist-card__meta");
  const bioRule = getRules(".artist-card--carousel .artist-card__bio");
  const pillRowRule = getRules(".artist-card--carousel .pill-row");

  assert.match(cardRule, /text-align:\s*center;/);
  assert.match(buttonCardRule, /text-align:\s*center;/);
  assert.match(metaRule, /align-items:\s*center;/);
  assert.match(metaRule, /text-align:\s*center;/);
  assert.match(bioRule, /text-align:\s*left;/);
  assert.match(pillRowRule, /justify-content:\s*center;/);
});

test("artist carousel and platform copy use expanded letter spacing", () => {
  const carouselHeadingRule = getRule(".artist-card--carousel h3");
  const bodyRule = getTopLevelRule("body");
  const paragraphRule = getTopLevelRule("p");

  assert.match(bodyRule, /letter-spacing:\s*var\(--tracking-body\);/);
  assert.match(paragraphRule, /letter-spacing:\s*var\(--tracking-copy\);/);
  assert.match(carouselHeadingRule, /letter-spacing:\s*var\(--tracking-display\);/);
  assert.match(carouselHeadingRule, /text-wrap:\s*balance;/);
  assert.match(css, /h1,\s*h2,\s*h3,\s*h4\s*\{[\s\S]*?letter-spacing:\s*var\(--tracking-heading\);/);
  assert.doesNotMatch(css, /letter-spacing:\s*-/);
});

test("artist carousel portraits and titles use a calmer profile-style crop", () => {
  const portraitRule = getRule(".artist-card--carousel .portrait-shell");
  const portraitImageRule = getRule(".artist-card--carousel .portrait-shell__image");
  const headingRule = getRule(".artist-card--carousel h3");

  assert.match(portraitRule, /aspect-ratio:\s*1\.22\s*\/\s*1;/);
  assert.match(portraitImageRule, /object-position:\s*var\(--portrait-position,\s*center\s+center\);/);
  assert.match(headingRule, /max-width:\s*9\.5ch;/);
  assert.match(headingRule, /font-size:\s*clamp\(1\.9rem,\s*2\.7vw,\s*2\.6rem\);/);
});

test("artist carousel hides only location metadata on homepage artist cards", () => {
  assert.match(carousel, /showLocation=\{false\}/);
});

test("artist carousel arrow buttons do not render duplicate chevron glyphs", () => {
  assert.doesNotMatch(carousel, /&#8249;|&#8250;/);
});

test("artist carousel arrow buttons use the expected visual direction", () => {
  assert.match(getArrowButtonBlock("left"), /move\(-1\);/);
  assert.match(getArrowButtonBlock("right"), /move\(1\);/);
});

test("artist carousel mobile arrows sit higher and farther apart", () => {
  assert.match(
    css,
    /@media \(max-width:\s*1100px\)\s*\{[\s\S]*?\.artist-stage__arrow\s*\{[\s\S]*?bottom:\s*44px;[\s\S]*?width:\s*58px;[\s\S]*?height:\s*58px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\)\s*\{[\s\S]*?\.artist-stage__arrow--left\s*\{[\s\S]*?left:\s*calc\(50% - 136px\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*1100px\)\s*\{[\s\S]*?\.artist-stage__arrow--right\s*\{[\s\S]*?right:\s*calc\(50% - 136px\);/,
  );
});

test("artist carousel mobile tags stay on one horizontal row", () => {
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.artist-card--carousel \.pill-row\s*\{[\s\S]*?flex-wrap:\s*nowrap;[\s\S]*?justify-content:\s*center;[\s\S]*?width:\s*100%;[\s\S]*?overflow:\s*visible;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.artist-card--carousel \.pill\s*\{[\s\S]*?flex:\s*0 1 auto;[\s\S]*?padding:\s*0 12px;[\s\S]*?font-size:\s*0\.94rem;[\s\S]*?white-space:\s*nowrap;/,
  );
});
