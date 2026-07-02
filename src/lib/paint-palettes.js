// Käsitsi valitud dominantvärvid iga teose kohta — vedeliksimulatsiooni
// emitterid süstivad neid toone, nii et ruum värvub alati parasjagu
// eksponeeritud teose järgi.
export const ARTWORK_PALETTES = {
  "kaljo-simson/hobby": ["#e8641f", "#7a3fa0", "#4fae3b", "#e8c832"],
  "kaljo-simson/probleem": ["#8a3fa8", "#e8d020", "#c05a28", "#3a7a4a"],
  "kaljo-simson/tehislindude-vabrikus": ["#e87818", "#2a9a8c", "#d8b820", "#8a2a20"],
  "kaljo-simson/tiivasirutus": ["#1fb5a8", "#e8b23c", "#2e8c3c", "#c8327a"],
  "van-gogh/tahine-oo": ["#2440a0", "#6fa8dc", "#e8d44f", "#1a2a5a"],
  "van-gogh/paevalilled": ["#e8c020", "#c88a1f", "#7a8c2e", "#e8dca0"],
  "van-gogh/mandlioied": ["#7ec4c8", "#4a9aa8", "#e8e8d8", "#6a7a4a"],
  "van-gogh/kohvikuterrass": ["#e8b820", "#24408c", "#d87018", "#4a6ab0"],
  "kalevi-poiss/visand-rand": ["#5f7d84", "#c8a67c", "#e8d9b8", "#b03c22"],
  "kalevi-poiss/visand-videvik": ["#6d5170", "#e3a262", "#3b3450", "#f2e4c4"],
};

export const DEFAULT_PALETTE = ["#b8763a", "#7a5a8a", "#4a7a6a", "#d8b868"];

export function getArtworkPalette(artistSlug, artworkSlug) {
  return ARTWORK_PALETTES[`${artistSlug}/${artworkSlug}`] || DEFAULT_PALETTE;
}

export function hexToRgb01(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255,
  };
}
