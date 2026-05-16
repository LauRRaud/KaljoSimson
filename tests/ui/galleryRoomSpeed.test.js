const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("admin gallery section controls gallery room wall movement speed", () => {
  const adminStudio = read("src/components/AdminStudio.jsx");
  const galleryClient = read("src/components/GalleryClient.jsx");
  const galleryPage = read("src/app/gallery/page.js");
  const contentStore = read("src/lib/content-store.js");
  const seedContent = read("content/site-content.json");

  assert.match(adminStudio, /updateSite\("galleryRoomSpeed", event\.target\.value\)/);
  assert.match(adminStudio, /<option value="slow">Aeglane<\/option>/);
  assert.match(adminStudio, /<option value="normal">Keskmine<\/option>/);
  assert.match(adminStudio, /<option value="fast">Kiire<\/option>/);

  assert.match(contentStore, /VALID_GALLERY_ROOM_SPEEDS/);
  assert.match(contentStore, /galleryRoomSpeed:\s*normalizeGalleryRoomSpeed/);
  assert.match(seedContent, /"galleryRoomSpeed":\s*"normal"/);

  assert.match(galleryPage, /roomSpeed=\{content\.site\.galleryRoomSpeed\}/);
  assert.match(galleryClient, /const roomTravelDurations = \{/);
  assert.match(galleryClient, /slow:\s*4600/);
  assert.match(galleryClient, /normal:\s*3200/);
  assert.match(galleryClient, /fast:\s*2200/);
  assert.match(galleryClient, /roomTravelDurations\[roomSpeed\]/);
});
