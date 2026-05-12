const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const source = readFileSync("src/components/LineWaves-JS-CSS.jsx", "utf8");
const preset = readFileSync("src/components/PageLineWaves.jsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("line waves color cycling does not move the line pattern", () => {
  assert.match(source, /float patternEnergy = max\(pattern \+ ridge \* verticalMask \* 0\.45, 0\.0\);/);
  assert.match(source, /float paletteT = uTime \* uColorCycleSpeed;/);
  assert.match(source, /float palettePhase = fract\(paletteT \/ 6\.2831853\);/);
  assert.match(source, /cycledPalette = mix\(uColor1, uColor2, smoothstep\(0\.0, 1\.0, paletteStep\)\);/);
  assert.match(source, /cycledPalette = mix\(uColor2, uColor3, smoothstep\(0\.0, 1\.0, paletteStep - 1\.0\)\);/);
  assert.match(source, /cycledPalette = mix\(uColor3, uColor1, smoothstep\(0\.0, 1\.0, paletteStep - 2\.0\)\);/);
  assert.doesNotMatch(source, /cycleT \* 0\.[0-9]+/);
  assert.match(source, /vec3 color = cycledPalette \* patternEnergy \* uBrightness;/);
});

test("page line waves use yellow red and green palette", () => {
  assert.match(preset, /brightness:\s*0\.28/);
  assert.match(preset, /color1:\s*"#eab308"/);
  assert.match(preset, /color2:\s*"#ef4444"/);
  assert.match(preset, /color3:\s*"#22c55e"/);
  assert.match(preset, /colorCycleSpeed:\s*0\.65/);
});

test("page line waves are strong enough to remain visible", () => {
  assert.match(css, /\.page-line-waves\s*\{[\s\S]*?opacity:\s*0\.5;/);
  assert.match(css, /\.page-line-waves\s*\{[\s\S]*?filter:\s*blur\(0\.35px\);/);
  assert.match(css, /html\[data-theme="dark"\] \.page-line-waves\s*\{[\s\S]*?opacity:\s*0\.56;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.page-line-waves\s*\{[\s\S]*?opacity:\s*0\.46;/);
});
