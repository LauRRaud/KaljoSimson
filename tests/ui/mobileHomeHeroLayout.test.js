const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const css = readFileSync("src/app/globals.css", "utf8");

test("mobile home hero keeps intro copy centered and readable", () => {
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__copy\s*\{[\s\S]*?width:\s*min\(calc\(100vw - 48px\),\s*34ch\);[\s\S]*?text-align:\s*center;[\s\S]*?text-wrap:\s*pretty;[\s\S]*?overflow-wrap:\s*break-word;[\s\S]*?hyphens:\s*auto;/,
  );
});

test("mobile home hero shows tagline words together and moves the cue upward", () => {
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-scroll-cue\s*\{[\s\S]*?bottom:\s*30px;/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__tagline\s*\{[\s\S]*?max-width:\s*min\(calc\(100vw - 48px\),\s*340px\);/,
  );
  assert.match(
    css,
    /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.home-title__tagline-word\s*\{[\s\S]*?animation-duration:\s*var\(--tagline-mobile-cycle-duration,\s*7\.55s\);[\s\S]*?animation-delay:\s*var\(--word-mobile-delay,\s*0s\);/,
  );
});
