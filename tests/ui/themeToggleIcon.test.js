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

  assert.match(toggle, /<circle cx="12" cy="12" r="4\.4" \/>/);
  assert.match(toggle, /<path d="M12 2\.5v2\.7M12 18\.8v2\.7M5\.3 5\.3l1\.9 1\.9M16\.8 16\.8l1\.9 1\.9M2\.5 12h2\.7M18\.8 12h2\.7M5\.3 18\.7l1\.9-1\.9M16\.8 7\.2l1\.9-1\.9" \/>/);
  assert.match(toggle, /className="theme-toggle__icon theme-toggle__icon--moon"[\s\S]*?<path[\s\S]*?fill="none"[\s\S]*?stroke="currentColor"/);
  assert.match(toggle, /<path[\s\S]*?d="M21 12\.8A9 9 0 1 1 11\.2 3a7 7 0 0 0 9\.8 9\.8Z"/);
  assert.match(globals, /\.site-nav \.theme-toggle\s*{[^}]*width:\s*30px;[^}]*min-width:\s*30px;[^}]*height:\s*30px;[^}]*margin-left:\s*0;[^}]*margin-right:\s*-3px;/s);
  assert.match(globals, /\.theme-toggle__icon\s*{[^}]*width:\s*28px;[^}]*height:\s*28px;/s);
  assert.match(globals, /\.theme-toggle__icon\s*{[^}]*stroke-width:\s*1\.9;/s);
  assert.match(globals, /\.theme-toggle__icon--moon\s*{[^}]*display:\s*block;[^}]*stroke-width:\s*1\.65;/s);
  assert.match(globals, /\.theme-toggle__icon--sun\s*{[^}]*display:\s*none;/s);
  assert.match(globals, /html\[data-theme="dark"\] \.theme-toggle__icon--moon\s*{[^}]*display:\s*none;/s);
  assert.match(globals, /html\[data-theme="dark"\] \.theme-toggle__icon--sun\s*{[^}]*display:\s*block;/s);
});
