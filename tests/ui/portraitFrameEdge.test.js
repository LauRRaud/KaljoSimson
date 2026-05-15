const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("artist portrait frames use warm light edge shadows instead of dark stripes", () => {
  const globals = read("src/app/globals.css");
  const windowRuleMatch = globals.match(
    /\.artist-card--carousel \.portrait-shell__window,[\s\S]*?\.profile-hero > \.portrait-shell \.portrait-shell__window\s*{(?<body>[\s\S]*?)\n}/,
  );
  const windowRule = windowRuleMatch?.groups?.body || "";
  const frameRuleMatch = globals.match(
    /\.artist-card--carousel \.portrait-shell__frame,[\s\S]*?\.profile-hero > \.portrait-shell \.portrait-shell__frame\s*{(?<body>[\s\S]*?)\n}/,
  );
  const frameRule = frameRuleMatch?.groups?.body || "";

  assert.match(
    globals,
    /\.artist-card--carousel \.portrait-shell::before,[\s\S]*?inset -1px 0 0 rgba\(246, 226, 166, 0\.18\)/,
  );
  assert.match(frameRule, /display:\s*grid;/);
  assert.match(frameRule, /padding:\s*var\(--portrait-frame-width\);/);
  assert.match(frameRule, /background:\s*var\(--frame-active-metal\);/);
  assert.match(windowRule, /0 0 0 1px rgba\(174, 136, 56, 0\.1\)/);
  assert.match(windowRule, /0 0 0 2px rgba\(255, 250, 231, 0\.2\)/);
  assert.doesNotMatch(
    globals,
    /\.artist-card--carousel \.portrait-shell::before,[\s\S]*?rgba\(18, 24, 29, 0\.(34|3)\)/,
  );
  assert.doesNotMatch(windowRule, /rgba\(45, 56, 64, 0\.3\)/);
});
