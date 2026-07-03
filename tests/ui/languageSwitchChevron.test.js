const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { readCss } = require("./readCss");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("language switch chevron sits apart from the locale label", () => {
  const globals = readCss();

  assert.match(globals, /\.language-switch__item\s*{[^}]*gap:\s*3px;/s);
  assert.match(globals, /\.language-switch__chevron\s*{[^}]*transform:\s*translate\(0,\s*1px\);/s);
});
