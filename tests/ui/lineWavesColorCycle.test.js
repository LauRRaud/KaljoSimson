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

test("page line waves use purple accent palette in both themes", () => {
  assert.match(preset, /const sharedPreset = \{/);
  assert.match(preset, /brightness:\s*0\.42/);
  assert.match(preset, /colorCycleSpeed:\s*0\.32/);
  assert.match(preset, /innerLineCount:\s*14/);
  assert.match(preset, /outerLineCount:\s*8/);
  assert.match(preset, /speed:\s*0\.035/);
  assert.match(preset, /mobileInnerLineCount:\s*7/);
  assert.match(preset, /mobileOuterLineCount:\s*5/);
  assert.match(preset, /mobileSpeed:\s*0\.026/);
  assert.match(preset, /mobileWarpIntensity:\s*0\.8/);
  assert.match(preset, /const lightPalette = \{\s*color1:\s*"#c9a64a",\s*color2:\s*"#ef4444",\s*color3:\s*"#7c3aed"/);
  assert.match(preset, /const darkPalette = \{\s*color1:\s*"#d4a72c",\s*color2:\s*"#ef4444",\s*color3:\s*"#8b5cf6"/);
  assert.match(preset, /const palette = theme === "dark" \? darkPalette : lightPalette;/);
});

test("page line waves are crisp and visible in light mode and clearer in dark mode", () => {
  assert.match(css, /\.page-line-waves\s*\{[\s\S]*?opacity:\s*0\.26;/);
  assert.match(css, /\.page-line-waves\s*\{[\s\S]*?filter:\s*none;/);
  assert.match(css, /html\[data-theme="dark"\] \.page-line-waves\s*\{[\s\S]*?opacity:\s*0\.28;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.page-line-waves\s*\{[\s\S]*?opacity:\s*0\.22;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?html\[data-theme="dark"\] \.page-line-waves\s*\{[\s\S]*?opacity:\s*0\.22;/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.page-line-waves\s*\{[\s\S]*?filter:\s*none;/);
});

test("mobile page line waves keep the pattern anchored toward the left edge", () => {
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.page-line-waves\s*\{[\s\S]*?inset:\s*-6vh -6vw auto -56vw;/,
  );
});
