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

  assert.match(toggle, /<circle cx="12" cy="12" r="3\.6" \/>/);
  assert.match(toggle, /<path d="M12 2\.6v2\.2M12 19\.2v2\.2M4\.6 4\.6l1\.55 1\.55M17\.85 17\.85l1\.55 1\.55M2\.6 12h2\.2M19\.2 12h2\.2M4\.6 19\.4l1\.55-1\.55M17\.85 6\.15l1\.55-1\.55" \/>/);
  assert.match(toggle, /className="theme-toggle__icon theme-toggle__icon--moon"[\s\S]*?<path[\s\S]*?fill="none"[\s\S]*?stroke="currentColor"/);
  assert.match(toggle, /<path[\s\S]*?d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/);
  assert.match(globals, /\.theme-toggle__icon\s*{[^}]*width:\s*22px;[^}]*height:\s*22px;/s);
  assert.match(globals, /\.theme-toggle__icon\s*{[^}]*stroke-width:\s*1\.75;/s);
  assert.match(globals, /\.theme-toggle__icon--moon\s*{[^}]*display:\s*block;/s);
  assert.match(globals, /\.theme-toggle__icon--sun\s*{[^}]*display:\s*none;/s);
  assert.match(globals, /html\[data-theme="dark"\] \.theme-toggle__icon--moon\s*{[^}]*display:\s*none;/s);
  assert.match(globals, /html\[data-theme="dark"\] \.theme-toggle__icon--sun\s*{[^}]*display:\s*block;/s);
});
