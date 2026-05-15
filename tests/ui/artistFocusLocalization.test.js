const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const artistCard = readFileSync("src/components/ArtistCard.jsx", "utf8");
const artistPage = readFileSync("src/app/artists/[slug]/page.js", "utf8");
const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");
const contentStore = readFileSync("src/lib/content-store.js", "utf8");
const content = JSON.parse(readFileSync("content/site-content.json", "utf8"));

test("artist focus tags are localized in public artist surfaces", () => {
  assert.match(artistCard, /getCopy\(focus, locale\)/);
  assert.match(artistPage, /getCopy\(focus, locale\)/);
  assert.match(contentStore, /focus: focusSource[\s\S]*normalizeText\(item,/);
});

test("seed artist focus tags include English copy", () => {
  for (const artist of content.artists) {
    assert.ok(Array.isArray(artist.focus), `${artist.slug} has focus tags`);

    for (const focus of artist.focus) {
      assert.equal(typeof focus.et, "string", `${artist.slug} has Estonian focus`);
      assert.equal(typeof focus.en, "string", `${artist.slug} has English focus`);
      assert.notEqual(focus.et.trim(), "", `${artist.slug} Estonian focus is not empty`);
      assert.notEqual(focus.en.trim(), "", `${artist.slug} English focus is not empty`);
    }
  }
});

test("admin focus editor renders and edits the active locale instead of object strings", () => {
  assert.match(adminStudio, /getCopy\(focus, editorLocale\)/);
  assert.match(adminStudio, /value=\{getFocusInputValue\(artist\.focus, editorLocale\)\}/);
  assert.match(adminStudio, /parseFocusInput\([\s\S]*?artist\.focus,[\s\S]*?editorLocale/);
  assert.doesNotMatch(adminStudio, /value=\{artist\.focus\.join\(", "\)\}/);
});
