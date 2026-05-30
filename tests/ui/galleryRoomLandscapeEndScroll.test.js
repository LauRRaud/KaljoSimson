const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("gallery room end navigation can align the final artwork at the end of the wall", () => {
  const galleryClient = read("src/components/GalleryClient.jsx");
  const globals = read("src/app/globals.css");

  assert.match(
    galleryClient,
    /const endAlignmentIndex =\s*direction > 0 && targetIndex === maxStartIndex \? slots\.length - 1 : targetIndex;/,
  );
  assert.match(
    galleryClient,
    /const targetScrollLeft = getRoomScrollTarget\(viewport, slots, endAlignmentIndex\);/,
  );
  assert.match(
    galleryClient,
    /await predecodeRoomImages\(getRoomImageSources\(endAlignmentIndex, scrollStep\)\);/,
  );
  assert.match(
    globals,
    /@media \(max-width:\s*1280px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*{[\s\S]*?\.gallery-room__wall::after\s*{[^}]*content:\s*"";[^}]*flex:\s*0 0 calc\(\(100vw - var\(--gallery-room-slot\)\) \/ 2\);/s,
  );
});
