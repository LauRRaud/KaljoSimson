const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(relativePath) {
  return readFileSync(path.join(__dirname, "..", "..", relativePath), "utf8");
}

test("mobile landscape lightbox keeps magnifier beside artwork and widens details", () => {
  const globals = read("src/app/globals.css");
  const landscapeRuleMatch = globals.match(
    /@media \(max-width:\s*1280px\) and \(max-height:\s*620px\) and \(orientation:\s*landscape\)\s*{(?<body>[\s\S]*?)\n}\n\n@media \(max-width:\s*430px\)/,
  );
  const landscapeRule = landscapeRuleMatch?.groups?.body || "";

  assert.match(
    landscapeRule,
    /\.lightbox__sheet\s*{[^}]*--lightbox-panel-height:\s*min\(96svh,\s*500px\);[^}]*--lightbox-detail-panel-height:\s*calc\(var\(--lightbox-panel-height\) - 28px\);[^}]*transform:\s*translateX\(clamp\(-56px,\s*-5vw,\s*-28px\)\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__grid\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) clamp\(245px,\s*27vw,\s*325px\);[^}]*gap:\s*clamp\(6px,\s*0\.8vw,\s*12px\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__image-window\s*{[^}]*padding-left:\s*var\(--magnifier-control-space\);[^}]*padding-bottom:\s*0;/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__magnifier-toggle\s*{[^}]*left:\s*0;[^}]*top:\s*50%;[^}]*transform:\s*translate\(calc\(-100% - var\(--magnifier-control-gap\)\),\s*-50%\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__details\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__details-row--medium\s*{[^}]*grid-column:\s*1 \/ -1;/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__aside\s*{[^}]*transform:\s*translateY\(clamp\(6px,\s*1\.4vh,\s*12px\)\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__actions\s*{[^}]*align-self:\s*center;/s,
  );
});
