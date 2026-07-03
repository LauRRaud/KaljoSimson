const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { readCss } = require("./readCss");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("admin gallery section controls gallery room wall movement speed", () => {
  const adminStudio = read("src/components/AdminStudio.jsx");
  const galleryClient = read("src/components/GalleryClient.jsx");
  const galleryPage = read("src/app/gallery/page.js");
  const galleryRoomExperience = read("src/components/GalleryRoomExperience.jsx");
  const globals = readCss();
  const contentStore = read("src/lib/content-store.js");
  const seedContent = read("content/site-content.json");

  assert.match(adminStudio, /updateSite\("galleryRoomSpeed", event\.target\.value\)/);
  assert.match(adminStudio, /<option value="slow">Aeglane<\/option>/);
  assert.match(adminStudio, /<option value="normal">Keskmine<\/option>/);
  assert.match(adminStudio, /<option value="fast">Kiire<\/option>/);

  assert.match(contentStore, /VALID_GALLERY_ROOM_SPEEDS/);
  assert.match(contentStore, /galleryRoomSpeed:\s*normalizeGalleryRoomSpeed/);
  assert.match(seedContent, /"galleryRoomSpeed":\s*"normal"/);

  assert.match(galleryPage, /GalleryRoomExperience/);
  assert.match(galleryPage, /defaultRoomSpeed=\{content\.site\.galleryRoomSpeed\}/);
  assert.match(galleryRoomExperience, /useState\(initialRoomSpeed\)/);
  assert.match(galleryRoomExperience, /className="gallery-room-page__control-group"/);
  assert.match(
    galleryRoomExperience,
    /className="gallery-room-speed"[\s\S]*?<FramePresetSwitch/,
  );
  assert.match(galleryRoomExperience, /aria-label=\{locale === "en" \? "Movement speed" : "Liikumise kiirus"\}/);
  assert.match(galleryRoomExperience, /setRoomSpeed\(speed\.id\)/);
  assert.match(galleryRoomExperience, /et: "Aeglasem"/);
  assert.match(galleryRoomExperience, /et: "Keskmine"/);
  assert.match(galleryRoomExperience, /et: "Kiirem"/);
  assert.match(galleryRoomExperience, /getSpeedDisplayLabel\(speed, locale\)/);
  assert.doesNotMatch(galleryRoomExperience, /gallery-room-speed--\$\{roomSpeed\}/);
  assert.doesNotMatch(galleryRoomExperience, /gallery-room-speed__dial/);
  assert.doesNotMatch(galleryRoomExperience, /gallery-room-speed__needle/);
  assert.doesNotMatch(galleryRoomExperience, /gallery-room-speed__hub/);
  assert.doesNotMatch(galleryRoomExperience, /gallery-room-speed__arc/);
  assert.doesNotMatch(galleryRoomExperience, /gallery-room-speed__mark/);
  assert.match(galleryRoomExperience, /roomSpeed=\{roomSpeed\}/);
  assert.match(galleryClient, /const roomTravelDurations = \{/);
  assert.match(galleryClient, /slow:\s*4600/);
  assert.match(galleryClient, /normal:\s*3200/);
  assert.match(galleryClient, /fast:\s*2200/);
  assert.match(galleryClient, /roomTravelDurations\[roomSpeed\]/);
  assert.match(galleryClient, /easeRoomScroll\(progress\)/);
  assert.match(galleryClient, /window\.requestAnimationFrame\(step\)/);
  assert.match(galleryClient, /window\.cancelAnimationFrame\(roomTravelFrameRef\.current\)/);
  assert.match(galleryClient, /await predecodeRoomImages\(getRoomImageSources\(endAlignmentIndex, scrollStep\)\)/);
  assert.match(galleryClient, /window\.requestIdleCallback\(decodeNextIdleImage/);

  assert.match(globals, /\.gallery-room-page__control-group\s*{/);
  assert.match(globals, /\.gallery-room-speed\s*{[^}]*display:\s*inline-flex;[^}]*gap:\s*8px;[^}]*height:\s*22px;/s);
  assert.match(globals, /\.gallery-room-speed__button\s*{[^}]*font-size:\s*0\.84rem;/s);
  assert.match(globals, /\.gallery-room-speed__button\s*{[^}]*height:\s*22px;/s);
  assert.match(globals, /\.gallery-room-speed__button--active\s*{/);
  assert.doesNotMatch(globals, /\.gallery-room-speed__dial/);
  assert.doesNotMatch(globals, /\.gallery-room-speed__needle/);
  assert.doesNotMatch(globals, /\.gallery-room-speed__hub/);
  assert.doesNotMatch(globals, /\.gallery-room-speed__arc/);
  assert.doesNotMatch(globals, /\.gallery-room-speed__button--active::after/);
  assert.doesNotMatch(globals, /\.gallery-room-speed__mark/);
});
