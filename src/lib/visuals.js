// Maalipinna varupresetid: kasutusel ainult siis, kui teosel pilti ei ole —
// raam saab siis maalitud gradiendi ja klaasja läike.
export const artworkPresets = [
  {
    id: "ember-mist",
    name: "Ember Mist",
    background:
      "radial-gradient(circle at 18% 24%, rgba(239, 205, 167, 0.78), transparent 22%), linear-gradient(140deg, #38241d 0%, #111317 45%, #635446 100%)",
    glaze:
      "linear-gradient(130deg, rgba(255,255,255,0.2), transparent 32%, rgba(255,255,255,0.06) 72%, transparent 100%)",
  },
  {
    id: "midnight-linen",
    name: "Midnight Linen",
    background:
      "radial-gradient(circle at 72% 20%, rgba(203, 184, 152, 0.34), transparent 24%), linear-gradient(160deg, #101217 0%, #27303b 52%, #111113 100%)",
    glaze:
      "linear-gradient(180deg, rgba(255,255,255,0.12), transparent 36%, rgba(255,255,255,0.05) 100%)",
  },
  {
    id: "ivory-haze",
    name: "Ivory Haze",
    background:
      "radial-gradient(circle at 30% 18%, rgba(248, 231, 212, 0.76), transparent 26%), linear-gradient(165deg, #a68f79 0%, #f0e1cc 46%, #6b6058 100%)",
    glaze:
      "linear-gradient(115deg, rgba(255,255,255,0.2), transparent 28%, rgba(160,126,93,0.18) 78%, transparent 100%)",
  },
  {
    id: "forest-veil",
    name: "Forest Veil",
    background:
      "radial-gradient(circle at 78% 26%, rgba(180, 165, 131, 0.45), transparent 24%), linear-gradient(160deg, #12201b 0%, #314138 56%, #111211 100%)",
    glaze:
      "linear-gradient(150deg, rgba(255,255,255,0.16), transparent 30%, rgba(255,255,255,0.05) 74%, transparent 100%)",
  },
  {
    id: "rose-smoke",
    name: "Rose Smoke",
    background:
      "radial-gradient(circle at 34% 24%, rgba(233, 201, 194, 0.6), transparent 23%), linear-gradient(150deg, #3b242b 0%, #171116 42%, #85707c 100%)",
    glaze:
      "linear-gradient(130deg, rgba(255,255,255,0.17), transparent 26%, rgba(255,255,255,0.07) 80%, transparent 100%)",
  },
  {
    id: "ashen-gold",
    name: "Ashen Gold",
    background:
      "radial-gradient(circle at 62% 22%, rgba(224, 199, 144, 0.58), transparent 24%), linear-gradient(155deg, #231f1d 0%, #605447 50%, #121212 100%)",
    glaze:
      "linear-gradient(180deg, rgba(255,255,255,0.18), transparent 34%, rgba(255,255,255,0.06) 100%)",
  },
];

export function getArtworkPreset(id) {
  return artworkPresets.find((preset) => preset.id === id) || artworkPresets[0];
}
