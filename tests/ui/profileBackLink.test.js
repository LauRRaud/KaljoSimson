const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("artist profile back link uses document navigation to avoid mobile ghost taps", () => {
  const page = read("src/app/artists/[slug]/page.js");

  assert.doesNotMatch(page, /import Link from "next\/link"/);
  assert.match(
    page,
    /<a className="inline-link profile-back-link" href={withLocale\("\/", locale\)}>/,
  );
  assert.doesNotMatch(page, /<Link className="inline-link profile-back-link"/);
});
