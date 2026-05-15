const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const brushCursor = readFileSync("src/components/BrushCursor.jsx", "utf8");
const siteAmbient = readFileSync("src/components/SiteAmbient.jsx", "utf8");

test("studio drawing surface hides splash paint but keeps the custom brush cursor", () => {
  assert.match(siteAmbient, /const isStudio = pathname === "\/studio";/);
  assert.match(siteAmbient, /\{isAdmin \|\| isStudio \? null : <SplashCursor \/>\}/);
  assert.doesNotMatch(brushCursor, /target\.closest\("\.studio-canvas, \.studio-paper"\)/);
  assert.doesNotMatch(brushCursor, /isOverStudioPaper/);
  assert.match(brushCursor, /if \(!point\) return null;/);
});
