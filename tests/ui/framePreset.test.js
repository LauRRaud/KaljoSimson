const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const test = require("node:test");

const adminStudio = readFileSync("src/components/AdminStudio.jsx", "utf8");
const contentStore = readFileSync("src/lib/content-store.js", "utf8");
const framePresetHydratorPath = "src/components/FramePresetHydrator.jsx";
const framePresetHydrator = existsSync(framePresetHydratorPath)
  ? readFileSync(framePresetHydratorPath, "utf8")
  : "";
const framePresetSwitchPath = "src/components/FramePresetSwitch.jsx";
const framePresetSwitch = existsSync(framePresetSwitchPath)
  ? readFileSync(framePresetSwitchPath, "utf8")
  : "";
const galleryPage = readFileSync("src/app/gallery/page.js", "utf8");
const pageShell = readFileSync("src/components/PageShell.jsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

function getRule(selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\n\\}`));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

test("site content stores a global frame preset with silver fallback", () => {
  assert.match(contentStore, /const VALID_FRAME_PRESETS = new Set\(\["silver", "gold"\]\);/);
  assert.match(contentStore, /function normalizeFramePreset\(value\)/);
  assert.match(contentStore, /framePreset:\s*normalizeFramePreset\(content\.site\?\.framePreset\)/);
});

test("admin studio lets editors choose silver or gold frame presets", () => {
  assert.match(adminStudio, /function updateFramePreset\(framePreset\)/);
  assert.match(adminStudio, /className="admin-frame-preset"/);
  assert.match(adminStudio, /aria-label="Raamide stiil"/);
  assert.match(adminStudio, /onClick=\{\(\) => updateFramePreset\("silver"\)\}/);
  assert.match(adminStudio, /onClick=\{\(\) => updateFramePreset\("gold"\)\}/);
  assert.match(adminStudio, /Hõbe/);
  assert.match(adminStudio, /Kuld/);
});

test("public pages expose the saved frame preset for CSS", () => {
  assert.match(pageShell, /import FramePresetHydrator from "@\/components\/FramePresetHydrator";/);
  assert.match(pageShell, /data-frame-preset=\{content\?\.site\?\.framePreset \|\| "silver"\}/);
  assert.match(pageShell, /<FramePresetHydrator defaultPreset=\{content\?\.site\?\.framePreset \|\| "silver"\} \/>/);
  assert.match(framePresetHydrator, /"use client";/);
  assert.match(framePresetHydrator, /const STORAGE_KEY = "beyondframes-frame-preset";/);
  assert.match(framePresetHydrator, /document\.querySelector\("\.page-shell"\)\?\.setAttribute\("data-frame-preset", preset\)/);
  assert.match(framePresetHydrator, /document\.body\?\.setAttribute\("data-frame-preset", preset\)/);
  assert.match(css, /body\[data-frame-preset="gold"\],\s*\.page-shell\[data-frame-preset="gold"\]\s*\{/);
  assert.match(css, /--frame-active-metal:\s*var\(--frame-gold-metal\);/);
  assert.match(css, /--frame-active-metal:\s*var\(--frame-silver-metal\);/);
  assert.match(css, /--frame-gold-metal:[\s\S]*?linear-gradient\(180deg,\s*rgba\(255,\s*250,\s*231,\s*0\.56\)/);
  assert.match(css, /--frame-gold-metal:[\s\S]*?#fff2cf[\s\S]*?#dfbd73[\s\S]*?#b3893d/);
  assert.match(css, /\.artwork-frame__window\s*\{[\s\S]*?background:\s*var\(--frame-active-metal\);/);
  assert.match(css, /\.artist-card--carousel \.portrait-shell::before,[\s\S]*?background:[\s\S]*?var\(--frame-active-metal\);/);
});

test("gallery page has a user-facing frame preset switch next to the back link", () => {
  const topbarRule = getRule(".gallery-room-page__topbar");

  assert.match(galleryPage, /import FramePresetSwitch from "@\/components\/FramePresetSwitch";/);
  assert.match(galleryPage, /className="gallery-room-page__topbar"/);
  assert.match(galleryPage, /<FramePresetSwitch defaultPreset=\{content\.site\.framePreset\} locale=\{locale\} \/>/);
  assert.match(framePresetSwitch, /"use client";/);
  assert.match(framePresetSwitch, /const STORAGE_KEY = "beyondframes-frame-preset";/);
  assert.match(framePresetSwitch, /document\.querySelector\("\.page-shell"\)\?\.setAttribute\("data-frame-preset", preset\)/);
  assert.match(framePresetSwitch, /document\.body\?\.setAttribute\("data-frame-preset", preset\)/);
  assert.match(framePresetSwitch, /className=\{`frame-preset-switch__button frame-preset-switch__button--\$\{preset\}/);
  assert.match(topbarRule, /left:\s*clamp\(14px,\s*2\.2vw,\s*28px\);/);
  assert.match(topbarRule, /right:\s*clamp\(14px,\s*2\.2vw,\s*28px\);/);
  assert.match(topbarRule, /justify-content:\s*space-between;/);
  assert.match(css, /\.frame-preset-switch__button\s*\{[\s\S]*?border:\s*none;/);
  assert.match(css, /\.frame-preset-switch__button\s*\{[\s\S]*?transition:[\s\S]*?transform 160ms ease/);
  assert.match(css, /--artwork-object-shadow:\s*[\s\S]*?0 10px 14px -9px rgba\(75,\s*52,\s*28,\s*0\.3\)/);
  assert.match(css, /--frame-preset-sphere-shadow:\s*[\s\S]*?0 4px 5px -3px rgba\(75,\s*52,\s*28,\s*0\.34\)/);
  assert.match(css, /\.frame-preset-switch__button\s*\{[\s\S]*?filter:\s*drop-shadow\(0 4px 4px rgba\(75,\s*52,\s*28,\s*0\.18\)\);[\s\S]*?box-shadow:[\s\S]*?var\(--frame-preset-sphere-shadow\);/);
  assert.doesNotMatch(css, /\.frame-preset-switch__button\s*\{[\s\S]*?border:\s*1px solid rgba\(24,\s*21,\s*18,\s*0\.22\);/);
  assert.match(css, /\.frame-preset-switch__button--active\s*\{[\s\S]*?transform:\s*scale\(1\.18\);/);
  assert.match(css, /\.frame-preset-switch__button--active\s*\{[\s\S]*?filter:\s*drop-shadow\(0 5px 5px rgba\(75,\s*52,\s*28,\s*0\.22\)\);[\s\S]*?box-shadow:[\s\S]*?var\(--frame-preset-sphere-shadow\);/);
  assert.doesNotMatch(css, /0 0 0 3px rgba\(196,\s*210,\s*222,\s*0\.92\)/);
  assert.doesNotMatch(css, /0 0 0 3px rgba\(217,\s*181,\s*95,\s*0\.9\)/);
  assert.doesNotMatch(css, /\.frame-preset-switch__button--active::after/);
  assert.match(css, /\.frame-preset-switch__button--silver/);
  assert.match(css, /\.frame-preset-switch__button--gold/);
});
