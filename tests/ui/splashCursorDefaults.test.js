const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const source = readFileSync("src/components/SplashCursor.jsx", "utf8");
const styles = readFileSync("src/app/globals.css", "utf8");
const brush2 = readFileSync("public/paint-brush2.svg", "utf8");
const brushCursor = readFileSync("src/components/BrushCursor.jsx", "utf8");
const siteAmbient = readFileSync("src/components/SiteAmbient.jsx", "utf8");

test("splash cursor default radius is slightly larger", () => {
  assert.match(source, /SPLAT_RADIUS = 0\.007,/);
  assert.match(source, /correctRadius\(config\.SPLAT_RADIUS \/ 100\.0\)/);
});

test("splash cursor renders above glass panels without blocking interaction", () => {
  assert.match(source, /zIndex:\s*20,/);
  assert.match(source, /pointerEvents:\s*"none"/);
});

test("desktop pointer uses a DOM paint-brush cursor instead of native cursor image URLs", () => {
  assert.match(siteAmbient, /import BrushCursor from "@\/components\/BrushCursor";/);
  assert.match(siteAmbient, /<\/div>[\s\S]*?\{isAdmin \? null : <SplashCursor \/>\}/);
  assert.match(siteAmbient, /isAdmin \? null : <BrushCursor \/>/);
  assert.doesNotMatch(styles, /cursor:\s*url\(/);
  assert.doesNotMatch(styles, /--brush-cursor/);
  assert.match(styles, /\.has-brush-cursor\s*\{[\s\S]*?cursor:\s*none;/);
  assert.match(styles, /\.brush-cursor\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?z-index:\s*2147483647;[\s\S]*?object-fit:\s*contain;[\s\S]*?filter:\s*opacity\(0\.9\);/);
  assert.match(styles, /\.brush-cursor--paint-brush2\s*\{[\s\S]*?width:\s*58px;[\s\S]*?height:\s*58px;/);
  assert.match(styles, /html\[data-theme="dark"\] \.brush-cursor\s*\{[\s\S]*?filter:\s*grayscale\(1\) invert\(1\) brightness\(1\) opacity\(0\.95\);/);
  assert.match(brushCursor, /document\.body\.classList\.add\("has-brush-cursor"\)/);
  assert.match(brushCursor, /createPortal\(/);
  assert.match(brushCursor, /document\.body,\s*\)/);
  assert.match(brushCursor, /className="brush-cursor brush-cursor--paint-brush2"/);
  assert.match(brushCursor, /src="\/paint-brush2\.svg"/);
  assert.match(brushCursor, /translate3d\(\$\{point\.x - 29\}px, \$\{point\.y - 5\}px, 0\) rotate\(-4deg\)/);
  assert.match(brush2, /width="128px"/);
  assert.match(brush2, /height="128px"/);
  assert.match(brush2, /viewBox="-9 -9 54 54"/);
  assert.match(brush2, /overflow="visible"/);
  assert.match(brush2, /<path fill="#111111"/);
  assert.match(brush2, /<path fill="#b56a43"/);
});
