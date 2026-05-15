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
    /\.lightbox__sheet\s*{[^}]*--lightbox-panel-height:\s*min\(96svh,\s*500px\);[^}]*--lightbox-detail-panel-height:\s*calc\(var\(--lightbox-panel-height\) - 54px\);[^}]*transform:\s*translateX\(clamp\(-56px,\s*-5vw,\s*-28px\)\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__grid\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) clamp\(270px,\s*29vw,\s*355px\);[^}]*gap:\s*clamp\(22px,\s*3vw,\s*40px\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__image-window\s*{[^}]*padding-left:\s*var\(--magnifier-control-space\);[^}]*padding-bottom:\s*0;[^}]*transform:\s*translateY\(clamp\(-6px,\s*-0\.8vh,\s*2px\)\);/s,
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
    /\.lightbox__artwork-frame \.artwork-frame__image\s*{[^}]*max-height:\s*calc\(var\(--lightbox-panel-height\) \+ 30px\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__details-row--medium\s*{[^}]*grid-column:\s*1 \/ -1;/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__aside\s*{[^}]*padding-right:\s*clamp\(10px,\s*1\.2vw,\s*16px\);[^}]*transform:\s*translateY\(clamp\(-12px,\s*-1\.8vh,\s*-5px\)\);/s,
  );
  assert.match(
    landscapeRule,
    /\.lightbox__actions\s*{[^}]*align-self:\s*center;/s,
  );
});
