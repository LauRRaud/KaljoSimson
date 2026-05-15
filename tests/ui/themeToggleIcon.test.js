const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("theme toggle icon shows the current theme with a smooth moon", () => {
  const toggle = read("src/components/ThemeToggle.jsx");
  const globals = read("src/app/globals.css");

  assert.match(toggle, /className="theme-toggle__sun-edge"/);
  assert.match(toggle, /className="theme-toggle__sun-face"/);
  assert.match(toggle, /<circle cx="12" cy="12" r="4\.2" \/>/);
  assert.match(toggle, /<path d="M12 2\.6v2\.2M12 19\.2v2\.2M5\.2 5\.2 6\.8 6\.8M17\.2 17\.2l1\.6 1\.6M2\.6 12h2\.2M19\.2 12h2\.2M5\.2 18\.8l1\.6-1\.6M17\.2 6\.8l1\.6-1\.6" \/>/);
  assert.match(toggle, /className="theme-toggle__moon-edge"/);
  assert.match(toggle, /className="theme-toggle__moon-face"/);
  assert.match(toggle, /<path[\s\S]*?d="M21 12\.8A9 9 0 1 1 11\.2 3a7 7 0 0 0 9\.8 9\.8Z"/);
  assert.match(globals, /\.site-nav \.theme-toggle\s*{[^}]*width:\s*30px;[^}]*min-width:\s*30px;[^}]*height:\s*30px;[^}]*margin-left:\s*0;[^}]*margin-right:\s*-3px;/s);
  assert.match(globals, /\.theme-toggle__icon\s*{[^}]*width:\s*28px;[^}]*height:\s*28px;[^}]*opacity:\s*0\.9;/s);
  assert.match(globals, /\.theme-toggle:hover \.theme-toggle__icon,\s*\.theme-toggle:focus-visible \.theme-toggle__icon\s*{[^}]*opacity:\s*1;/s);
  assert.match(globals, /\.pwa-install-button__icon\s*{[^}]*opacity:\s*0\.9;/s);
  assert.match(globals, /\.pwa-install-button:hover \.pwa-install-button__icon,\s*\.pwa-install-button:focus-visible \.pwa-install-button__icon\s*{[^}]*opacity:\s*1;/s);
  assert.match(globals, /\.theme-toggle__icon\s*{[^}]*stroke-width:\s*1\.9;/s);
  assert.match(globals, /\.theme-toggle__icon--moon\s*{[^}]*display:\s*block;[^}]*stroke-width:\s*1\.65;/s);
  assert.match(globals, /\.theme-toggle__moon-edge\s*{[^}]*stroke:\s*rgba\(232,\s*226,\s*216,\s*0\.72\);[^}]*stroke-width:\s*2\.18;/s);
  assert.match(globals, /\.theme-toggle__moon-face\s*{[^}]*stroke:\s*currentColor;[^}]*stroke-width:\s*1\.65;/s);
  assert.match(globals, /\.theme-toggle__icon--sun\s*{[^}]*display:\s*none;/s);
  assert.match(globals, /\.theme-toggle__sun-edge\s*{[^}]*stroke:\s*rgba\(232,\s*226,\s*216,\s*0\.72\);[^}]*stroke-width:\s*2\.18;/s);
  assert.match(globals, /\.theme-toggle__sun-face\s*{[^}]*stroke:\s*currentColor;[^}]*stroke-width:\s*1\.65;/s);
  assert.match(globals, /html\[data-theme="dark"\] \.theme-toggle__icon--moon\s*{[^}]*display:\s*none;/s);
  assert.match(globals, /html\[data-theme="dark"\] \.theme-toggle__icon--sun\s*{[^}]*display:\s*block;/s);
});
