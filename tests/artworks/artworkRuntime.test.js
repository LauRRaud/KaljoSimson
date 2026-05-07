const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

test("upload endpoint writes only validated images to UPLOAD_DIR", () => {
  const route = readFileSync("src/app/api/upload/route.js", "utf8");

  assert.match(route, /process\.env\.UPLOAD_DIR/);
  assert.match(route, /NEXT_PUBLIC_UPLOAD_BASE_URL/);
  assert.match(route, /mimeType/i);
  assert.match(route, /jpg|jpeg|png|webp/);
  assert.match(route, /MAX_SIZE_BYTES/);
  assert.doesNotMatch(route, /public["']?,\s*["']uploads/);
});

test("admin authentication uses ADMIN_PASSWORD from environment", () => {
  const auth = readFileSync("src/lib/admin-auth.js", "utf8");

  assert.match(auth, /process\.env\.ADMIN_PASSWORD/);
  assert.doesNotMatch(auth, /BEYONDFRAMES_ADMIN_PASSWORD/);
});

test("public artist gallery reads published artworks dynamically from database", () => {
  const page = readFileSync("src/app/artists/[slug]/gallery/page.js", "utf8");

  assert.match(page, /export const dynamic = ["']force-dynamic["']/);
  assert.match(page, /getPublishedArtworks/);
});

test("artwork admin route is protected and manages all artworks", () => {
  const page = readFileSync("src/app/admin/artworks/page.js", "utf8");
  const actions = readFileSync("src/app/admin/artworks/actions.js", "utf8");

  assert.match(page, /isAdminAuthenticated/);
  assert.match(page, /getAdminArtworks/);
  assert.match(actions, /createArtworkAction/);
  assert.match(actions, /updateArtworkAction/);
  assert.match(actions, /deleteArtworkAction/);
  assert.match(actions, /unlink/);
});
