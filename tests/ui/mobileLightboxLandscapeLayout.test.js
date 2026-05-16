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
    /\.lightbox__sheet\s*{[^}]*--lightbox-panel-height:\s*min\(100svh,\s*540px\);[^}]*--lightbox-detail-panel-height:\s*calc\(var\(--lightbox-panel-height\) - 62px\);[^}]*transform:\s*translateX\(clamp\(-24px,\s*-2vw,\s*-10px\)\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__grid\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) clamp\(265px,\s*28vw,\s*340px\);[^}]*gap:\s*clamp\(8px,\s*1vw,\s*14px\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__image-window\s*{[^}]*padding-left:\s*0;[^}]*padding-bottom:\s*0;[^}]*transform:\s*translateY\(clamp\(-6px,\s*-0\.8vh,\s*2px\)\);/s,
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
    /\.lightbox__artwork-frame\s*{[^}]*max-width:\s*100%;/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__artwork-frame \.artwork-frame__image\s*{[^}]*width:\s*calc\(\(var\(--lightbox-panel-height\) - clamp\(18px,\s*3vh,\s*34px\)\) \* 1\.48\);[^}]*max-height:\s*calc\(var\(--lightbox-panel-height\) \+ 52px\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__details-row--medium\s*{[^}]*grid-column:\s*1 \/ -1;/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__aside\s*{[^}]*padding:\s*clamp\(10px,\s*1\.4vh,\s*14px\) clamp\(10px,\s*1\.2vw,\s*16px\) clamp\(12px,\s*1\.8vh,\s*18px\) clamp\(12px,\s*1\.5vw,\s*18px\);[^}]*transform:\s*translate\(\s*clamp\(8px,\s*1\.4vw,\s*18px\),\s*clamp\(-12px,\s*-1\.8vh,\s*-5px\)\s*\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__actions\s*{[^}]*align-self:\s*center;/s,
  );
});
