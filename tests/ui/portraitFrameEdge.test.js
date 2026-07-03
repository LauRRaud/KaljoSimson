const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

// globals.css võib olla tükeldatud @import-failideks — loe kogu kaskaad
// samas järjekorras kokku, et testid ei sõltuks failipiiridest.
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

// Portreeraami kolm konteksti peavad elama ÜHES selektorigrupis, et
// avaleht, artistide leht ja profiilileht ei saaks omavahel lahku minna.
const CONTEXT_TAIL =
  ",\\s*\\.bfl-author \\.portrait-shell,\\s*\\.artists-index__portrait \\.portrait-shell";

function findRule(css, firstSelector, tail) {
  const match = css.match(
    new RegExp(
      `${firstSelector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${tail}\\s*{(?<body>[^}]*)}`,
    ),
  );
  return match?.groups?.body || "";
}

test("portrait frames share the artwork window's edge variables on all pages", () => {
  const globals = readCss();

  // Ühine plokk: kõik kontekstid koos, serv + vari samadest muutujatest
  // mis maaliraamil (.artwork-frame__window).
  const shellRule = findRule(globals, ".profile-hero > .portrait-shell", CONTEXT_TAIL);
  assert.ok(shellRule, "consolidated portrait shell rule must exist");
  assert.match(shellRule, /background:\s*var\(--frame-active-metal\);/);
  assert.match(
    shellRule,
    /box-shadow:\s*var\(--frame-edge-shadows\),\s*var\(--artwork-object-shadow\);/,
  );

  // Sheen (tumendab metalli heleda ülaserva nagu maalil) tuleb samuti
  // ühistest preset-teadlikest muutujatest.
  const sheenRule = findRule(
    globals,
    ".profile-hero > .portrait-shell .portrait-shell__frame::before",
    "[\\s\\S]*?\\.artists-index__portrait \\.portrait-shell \\.portrait-shell__frame::before",
  );
  assert.match(sheenRule, /background:\s*var\(--frame-sheen\);/);
  assert.match(sheenRule, /opacity:\s*var\(--frame-sheen-opacity\);/);

  // Maaliraam ise kasutab SAMU muutujaid — üks tõeallikas.
  const artworkWindow = findRule(globals, ".artwork-frame__window", "");
  assert.match(
    artworkWindow,
    /box-shadow:\s*var\(--frame-edge-shadows\),\s*var\(--artwork-object-shadow\);/,
  );
  const artworkSheen = findRule(globals, ".artwork-frame__window::before", "");
  assert.match(artworkSheen, /background:\s*var\(--frame-sheen\);/);
  assert.match(artworkSheen, /opacity:\s*var\(--frame-sheen-opacity\);/);

  // Kontaktsein (avalehe finaal) on samas raamikeeles.
  const contactRule = findRule(globals, ".bfl-contactframe", "");
  assert.match(
    contactRule,
    /box-shadow:\s*var\(--frame-edge-shadows\),\s*var\(--artwork-object-shadow\);/,
  );
  const contactSheen = findRule(globals, ".bfl-contactframe::before", "");
  assert.match(contactSheen, /background:\s*var\(--frame-sheen\);/);

  // Muutujad on preset-teadlikud: kuld ja pronks defineerivad oma sheeni.
  for (const preset of ["gold", "bronze"]) {
    const presetBlock = findRule(
      globals,
      `html[data-frame-preset="${preset}"]`,
      `,\\s*body\\[data-frame-preset="${preset}"\\],\\s*\\.page-shell\\[data-frame-preset="${preset}"\\]`,
    );
    assert.match(presetBlock, /--frame-sheen:/, `${preset} preset defines --frame-sheen`);
    assert.match(presetBlock, /--frame-sheen-opacity:/, `${preset} preset defines opacity`);
  }
});

test("portrait keeps a single outer frame — no inner liner from the artwork", () => {
  const globals = readCss();

  const windowRule = findRule(
    globals,
    ".profile-hero > .portrait-shell .portrait-shell__window",
    "[\\s\\S]*?\\.artists-index__portrait \\.portrait-shell \\.portrait-shell__window",
  );
  // pildi serv on õhuke 1px joon, MITTE maaliraami sisemine liist
  assert.match(windowRule, /inset 0 0 0 1px var\(--frame-surface-inner-line\)/);
  assert.doesNotMatch(windowRule, /--frame-window-inner-highlight/);
  assert.doesNotMatch(windowRule, /--frame-window-inner-line/);
  assert.doesNotMatch(windowRule, /--frame-surface-ring/);
});

test("dead carousel context is gone from portrait frame selectors", () => {
  const globals = readCss();
  assert.doesNotMatch(globals, /artist-card--carousel/);
  assert.doesNotMatch(globals, /artist-stage/);
});
