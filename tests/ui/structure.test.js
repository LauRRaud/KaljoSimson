const test = require("node:test");
const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "..");

function read(p) {
  return readFileSync(path.join(root, p), "utf8");
}

// Leht on ühe kunstniku visiitkaart: avaleht + /galerii + /kunstnik + /admin.
test("uued leheteed on olemas, vanad eemaldatud", () => {
  assert.ok(existsSync(path.join(root, "src/app/page.js")));
  assert.ok(existsSync(path.join(root, "src/app/galerii/page.js")));
  assert.ok(existsSync(path.join(root, "src/app/kunstnik/page.js")));
  assert.ok(existsSync(path.join(root, "src/app/admin/page.js")));
  assert.ok(existsSync(path.join(root, "src/app/api/upload/route.js")));

  for (const removed of ["src/app/studio", "src/app/artists", "src/app/gallery"]) {
    assert.ok(!existsSync(path.join(root, removed)), `${removed} peab olema kustutatud`);
  }
});

test("sisumudel on ühe kunstniku oma", () => {
  const content = JSON.parse(read("content/site-content.json"));

  assert.equal(content.site.title, "Kaljo Simson");
  assert.ok(content.artist, "content.artist puudub");
  assert.ok(!content.artists, "vana artists-massiiv peab olema kadunud");
  assert.equal(content.artist.name, "Kaljo Simson");
  assert.ok(content.artist.artworks.length >= 4);

  for (const artwork of content.artist.artworks) {
    assert.ok(artwork.image, `${artwork.slug} pilt puudub`);
    assert.ok(
      existsSync(path.join(root, "public", decodeURIComponent(artwork.image))),
      `${artwork.image} faili ei ole public/ all`,
    );
  }
});

test("package.json ei vea enam prisma/ogl sõltuvusi", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.equal(pkg.name, "kaljosimson");
  assert.ok(!pkg.dependencies.prisma);
  assert.ok(!pkg.dependencies["@prisma/client"]);
  assert.ok(!pkg.dependencies.ogl);
  assert.ok(!pkg.scripts.postinstall);
});

test("navigatsioon viitab uutele teedele", () => {
  const nav = read("src/lib/nav.js");

  assert.ok(nav.includes('"/galerii"'));
  assert.ok(nav.includes('"/kunstnik"'));
  assert.ok(!nav.includes("/studio"));
  assert.ok(!nav.includes("/artists"));
});
