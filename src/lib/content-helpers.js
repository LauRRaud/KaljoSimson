import { artworkPresets, portraitPresets } from "@/lib/visuals";

export const DEFAULT_LOCALE = "et";

export function cloneContent(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getCopy(value, locale = DEFAULT_LOCALE) {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return value[locale] || value.et || value.en || "";
}

export function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createEmptyLocalizedText(et = "", en = "") {
  return {
    et,
    en,
  };
}

export function createEmptyArtwork(artistIndex = 0, artworkIndex = 0) {
  const preset = artworkPresets[(artistIndex * 3 + artworkIndex) % artworkPresets.length];

  return {
    slug: `teos-${artistIndex + 1}-${artworkIndex + 1}`,
    title: createEmptyLocalizedText(
      `Uus teos ${artworkIndex + 1}`,
      `New work ${artworkIndex + 1}`,
    ),
    year: "2026",
    medium: createEmptyLocalizedText("Akrüül lõuendil", "Acrylic on canvas"),
    size: "100 x 80 cm",
    status: createEmptyLocalizedText("Saadaval", "Available"),
    frame: artworkIndex % 2 === 0 ? "obsidian" : "ivory",
    visualPresetId: preset.id,
    image: "",
    showInGallery: false,
    galleryOrder: 0,
    description: createEmptyLocalizedText(
      "Lühike teose kirjeldus eesti keeles.",
      "Short artwork description in English.",
    ),
  };
}

export function createEmptyArtist(index = 0) {
  const portraitPreset = portraitPresets[index % portraitPresets.length];

  return {
    slug: `kunstnik-${index + 1}`,
    name: `Uus kunstnik ${index + 1}`,
    location: "Tallinn, Eesti",
    practiceSince: "2026",
    portraitPresetId: portraitPreset.id,
    portraitImage: "",
    portraitPosition: "center center",
    role: createEmptyLocalizedText(
      "Kaasaegne maalikunstnik",
      "Contemporary painter",
    ),
    shortBio: createEmptyLocalizedText(
      "Lühike tutvustus kunstniku käekirjast ja praktikast.",
      "Short introduction to the artist and their practice.",
    ),
    biography: createEmptyLocalizedText(
      "Pikem biograafiline tekst eesti keeles.",
      "Longer biographical text in English.",
    ),
    statement: createEmptyLocalizedText(
      "Lühike statement kunstniku enda vaatenurgast.",
      "Short statement from the artist's perspective.",
    ),
    galleryIntro: createEmptyLocalizedText(
      "Sissejuhatus kunstniku teoste galerii vaatele.",
      "Introduction for the artist's gallery view.",
    ),
    focus: ["valgus", "materjal", "vaikus"],
    artworks: [createEmptyArtwork(index, 0), createEmptyArtwork(index, 1)],
  };
}
