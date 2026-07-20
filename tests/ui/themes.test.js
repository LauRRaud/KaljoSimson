const test = require("node:test");
const assert = require("node:assert/strict");
const { readCss } = require("./readCss");

// Kaks värviteemat: hele (vaikimisi :root) ja tume.
test("hele ja tume teema on defineeritud, palett on eemaldatud", () => {
  const css = readCss();

  assert.ok(css.includes(":root {"), ":root (hele) puudub");
  assert.ok(css.includes('html[data-theme="tume"]'), "tume teema puudub");
  assert.ok(!css.includes('data-theme="palett"'), "palett teema peab olema eemaldatud");
});

test("tume teema defineerib põhitokenid", () => {
  const css = readCss();
  const tume = css.split('html[data-theme="tume"]')[1] ?? "";

  for (const token of ["--bg", "--text", "--accent", "--room-bg", "--glass-panel-bg"]) {
    assert.ok(tume.includes(`${token}:`), `tume teemal puudub ${token}`);
  }
});

// NB: hexid peavad käima 00-tokens.css-iga kaasa — kui aktsenttooni muudad,
// uuenda ka siin (oranž heledamaks: #d1730f -> #e07f1c, commit 353375f).
test("hele teema aktsendid tulevad maalitud portree värvidest", () => {
  const css = readCss();
  const hele = css.split('html[data-theme="tume"]')[0] ?? "";

  assert.ok(hele.includes("#e07f1c"), "oranž aktsent puudub");
  assert.ok(hele.includes("#b23a88"), "magenta aktsent puudub");
  assert.ok(hele.includes("#2e93b8"), "türkiis aktsent puudub");
  assert.ok(hele.includes("#f2c230"), "kollane aktsent puudub");
});

test("teemavahetus on üks päike/kuu nupp", () => {
  const css = readCss();

  assert.ok(css.includes(".theme-toggle"));
  assert.ok(css.includes(".theme-toggle__icon--moon"));
  assert.ok(css.includes(".theme-toggle__icon--sun"));
  assert.ok(!css.includes(".theme-switch__dot"));
});
