const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const test = require("node:test");

test("Artwork schema stores artwork metadata without commerce or personal data fields", () => {
  assert.ok(existsSync("prisma/schema.prisma"), "Missing Prisma schema");

  const schema = readFileSync("prisma/schema.prisma", "utf8");
  const artworkModel = schema.match(/model Artwork\s*\{([\s\S]*?)\n\}/);

  assert.ok(artworkModel, "Missing Artwork model");

  for (const field of [
    "id",
    "title",
    "slug",
    "description",
    "imageUrl",
    "filename",
    "originalName",
    "mimeType",
    "size",
    "altText",
    "sortOrder",
    "isPublished",
    "createdAt",
    "updatedAt",
  ]) {
    assert.match(artworkModel[1], new RegExp(`\\b${field}\\b`));
  }

  assert.doesNotMatch(schema, /\b(price|buyer|order|payment|booking|reservation)\b/i);
  assert.doesNotMatch(schema, /\b(email|phone|customer|personalData)\b/i);
});
