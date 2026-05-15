const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("saved gold frame preset is applied before the first client paint", () => {
  const layout = read("src/app/layout.js");
  const globals = read("src/app/globals.css");
  const hydrator = read("src/components/FramePresetHydrator.jsx");
  const switcher = read("src/components/FramePresetSwitch.jsx");

  assert.match(layout, /beyondframes-frame-preset/);
  assert.match(layout, /document\.documentElement\.dataset\.framePreset\s*=/);
  assert.match(globals, /html\[data-frame-preset="gold"\]/);
  assert.match(hydrator, /document\.documentElement\?\.setAttribute\("data-frame-preset", preset\)/);
  assert.match(switcher, /document\.documentElement\?\.setAttribute\("data-frame-preset", preset\)/);
});
