const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");

test("adding an artist marks the new artist card for automatic scrolling", () => {
  assert.match(adminStudio, /const artistCardRefs = useRef\(\{\}\);/);
  assert.match(adminStudio, /const \[scrollToArtistKey, setScrollToArtistKey\] = useState\(""\);/);
  assert.match(adminStudio, /setScrollToArtistKey\(getArtistKey\(newArtist, nextIndex\)\);/);
});

test("admin studio scrolls the newly added artist card into view", () => {
  assert.match(adminStudio, /useEffect\(\(\) => \{/);
  assert.match(adminStudio, /artistCardRefs\.current\[scrollToArtistKey\]\?\.scrollIntoView\(/);
  assert.match(adminStudio, /behavior:\s*"smooth"/);
  assert.match(adminStudio, /block:\s*"start"/);
});

test("artist cards register DOM refs by artist key", () => {
  assert.match(adminStudio, /ref=\{\(element\) => \{/);
  assert.match(adminStudio, /artistCardRefs\.current\[artistKey\] = element;/);
});
