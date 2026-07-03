const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");

// globals.css on tükeldatud @import-failideks kataloogis src/app/styles/.
// Testid loevad kogu kaskaadi samas järjekorras kokku, et mitte sõltuda
// failipiiridest.
function readCss() {
  const root = path.join(__dirname, "..", "..");
  const entry = path.join(root, "src", "app", "globals.css");
  const raw = readFileSync(entry, "utf8");
  const importRe = /@import\s+"(\.\/[^"]+)";/g;
  if (!importRe.test(raw)) return raw;
  importRe.lastIndex = 0;
  let out = "";
  let m;
  while ((m = importRe.exec(raw))) {
    const p = path.join(root, "src", "app", m[1]);
    assert.ok(existsSync(p), `import puudub: ${m[1]}`);
    out += readFileSync(p, "utf8");
  }
  return out;
}

module.exports = { readCss };
