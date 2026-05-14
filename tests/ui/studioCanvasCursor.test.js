const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const styles = readFileSync("src/app/globals.css", "utf8");

test("studio canvas hides the native crosshair under the brush cursor", () => {
  assert.match(styles, /\.studio-canvas\s*\{[\s\S]*?cursor:\s*none;/);
  assert.doesNotMatch(styles, /\.studio-canvas\s*\{[\s\S]*?cursor:\s*crosshair;/);
});
