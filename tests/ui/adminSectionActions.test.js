const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("admin sections render repeated save actions after each main section", () => {
  assert.match(adminStudio, /function AdminSectionActions\(/);
  assert.match(
    adminStudio,
    /id="admin-site"[\s\S]*?<AdminSectionActions[\s\S]*?id="admin-gallery"[\s\S]*?<AdminSectionActions[\s\S]*?id="admin-artists"[\s\S]*?<AdminSectionActions/,
  );
  assert.match(adminStudio, /onSave=\{handleSave\}/);
  assert.match(adminStudio, /onExport=\{handleExport\}/);
});

test("section save actions have responsive footer styling", () => {
  assert.match(css, /\.admin-section-actions\s*\{[\s\S]*?justify-content:\s*space-between;/);
  assert.match(css, /\.admin-section-actions\s*\{[\s\S]*?border-top:\s*1px solid/);
  assert.match(
    css,
    /@media \(max-width:\s*1100px\)\s*\{[\s\S]*?\.admin-section-actions\s*\{[\s\S]*?flex-direction:\s*column;/,
  );
});
