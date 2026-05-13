const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");

test("admin studio does not render portrait preset controls", () => {
  assert.doesNotMatch(adminStudio, /portraitPresetId/);
  assert.doesNotMatch(adminStudio, /portraitPresets/);
});

test("admin studio does not render artwork preset controls", () => {
  assert.doesNotMatch(adminStudio, /visualPresetId/);
  assert.doesNotMatch(adminStudio, /artworkPresets/);
  assert.doesNotMatch(adminStudio, /Pildi preset/);
  assert.doesNotMatch(adminStudio, /Kasuta presetit/);
});

test("admin studio hides homepage fields that are not used on the live site", () => {
  assert.doesNotMatch(adminStudio, /<label>Domeen<\/label>/);
  assert.doesNotMatch(adminStudio, /label="Hero pealkiri"/);
  assert.doesNotMatch(adminStudio, /label="Kontseptsiooni pealkiri"/);
  assert.doesNotMatch(adminStudio, /label="Kontseptsiooni tekst"/);
  assert.doesNotMatch(adminStudio, /label={`MĆ¤rksĆµna \$\{index \+ 1\}`}/);
});

test("admin studio hides artist fields that are not rendered on visible pages", () => {
  assert.doesNotMatch(adminStudio, /<label>Praktika algus<\/label>/);
  assert.doesNotMatch(adminStudio, /label="Statement"/);
  assert.doesNotMatch(adminStudio, /label="Galerii sissejuhatus"/);
});

test("admin studio does not expose demo reset controls", () => {
  assert.doesNotMatch(adminStudio, /Taasta demo/);
  assert.doesNotMatch(adminStudio, /handleReset/);
  assert.doesNotMatch(adminStudio, /demoContent/);
});
