const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const styles = readFileSync("src/app/globals.css", "utf8");

function getRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = styles.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test("studio canvas hides the native crosshair so the custom brush cursor is visible", () => {
  const canvasRule = getRule(".studio-canvas");
  const brushCursorCanvasRule = getRule(".has-brush-cursor .studio-canvas");

  assert.match(canvasRule, /cursor:\s*none;/);
  assert.match(brushCursorCanvasRule, /cursor:\s*none;/);
  assert.doesNotMatch(canvasRule, /cursor:\s*crosshair;/);
});
