const test = require("node:test");
const assert = require("node:assert/strict");
const { readCss } = require("./readCss");

// Galeriiruum ja lightbox säilisid ümberdisainis; nende pinnad tulevad
// teematokenitest, mitte kõvakodeeritud gradientidest.
test("galeriiruum ja lightbox kasutavad teemapõhist seina", () => {
  const css = readCss();
  const roomBlock = css.split(".gallery-room {")[1]?.split("}")[0] ?? "";
  const lightboxBlock = css.split(".lightbox {")[1]?.split("}")[0] ?? "";

  assert.ok(roomBlock.includes("var(--room-bg)"), "galeriiruumi sein ei tule teemast");
  assert.ok(lightboxBlock.includes("var(--room-bg)"), "lightboxi taust ei tule teemast");
});

test("raamipresetid (hõbe/kuld/pronks) on alles", () => {
  const css = readCss();

  assert.ok(css.includes('data-frame-preset="silver"'));
  assert.ok(css.includes('data-frame-preset="gold"'));
  assert.ok(css.includes('data-frame-preset="bronze"'));
  assert.ok(css.includes(".frame-preset-switch__button"));
});

test("maaliraami kaskaad on alles", () => {
  const css = readCss();

  for (const selector of [
    ".artwork-frame__window",
    ".artwork-frame__surface",
    ".gallery-room__slot",
    ".lightbox__magnifier-lens",
  ]) {
    assert.ok(css.includes(selector), `${selector} puudub`);
  }
});
