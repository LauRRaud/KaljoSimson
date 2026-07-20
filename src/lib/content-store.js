import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { unstable_noStore as noStore } from "next/cache";
import seedContent from "../../content/site-content.json";
import { cloneContent } from "@/lib/content-helpers";
import { artworkPresets } from "@/lib/visuals";

// Sisu elab kahes kihis:
// - content/site-content.json — gitis olev lähteseis (seed)
// - content/site-content.local.json — adminis tehtud muudatused (gitignore),
//   nii et serveripoolne git pull ei satu kunagi konflikti sisuga.
const LOCAL_PATH = path.join(process.cwd(), "content", "site-content.local.json");

const VALID_ARTWORK_PRESETS = new Set(artworkPresets.map((preset) => preset.id));
const VALID_FRAME_PRESETS = new Set(["silver", "gold", "bronze"]);
const VALID_GALLERY_ROOM_SPEEDS = new Set(["slow", "normal", "fast"]);

function stringOrFallback(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function booleanOrFallback(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function numberOrFallback(value, fallback = 0) {
  const number = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(number) ? number : fallback;
}

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\̀-\ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value, fallback = { et: "", en: "" }) {
  const source =
    typeof value === "string"
      ? { et: value, en: value }
      : value && typeof value === "object"
        ? value
        : {};

  return {
    et: stringOrFallback(source.et, fallback?.et || ""),
    en: stringOrFallback(source.en, fallback?.en || ""),
  };
}

function normalizeArtwork(artwork, index) {
  const fallbackSlug = `teos-${index + 1}`;

  return {
    slug: slugify(artwork?.slug || artwork?.title?.et || fallbackSlug) || fallbackSlug,
    title: normalizeText(artwork?.title, { et: `Teos ${index + 1}`, en: `Work ${index + 1}` }),
    year: stringOrFallback(artwork?.year, "Dateerimata"),
    medium: normalizeText(artwork?.medium, {
      et: "Meedium täpsustamisel",
      en: "Medium to be confirmed",
    }),
    size: stringOrFallback(artwork?.size, "Mõõdud täpsustamisel"),
    status: normalizeText(artwork?.status, {
      et: "Küsi saadavust",
      en: "Availability on request",
    }),
    frame: artwork?.frame === "ivory" ? "ivory" : "obsidian",
    visualPresetId: VALID_ARTWORK_PRESETS.has(artwork?.visualPresetId)
      ? artwork.visualPresetId
      : artworkPresets[index % artworkPresets.length].id,
    image: stringOrFallback(artwork?.image),
    showInGallery: booleanOrFallback(artwork?.showInGallery, true),
    galleryOrder: numberOrFallback(artwork?.galleryOrder, index),
    description: normalizeText(artwork?.description),
  };
}

function normalizeArtist(artist) {
  const base = seedContent.artist;
  const artworksSource = Array.isArray(artist?.artworks)
    ? artist.artworks
    : base.artworks;
  const focusSource =
    Array.isArray(artist?.focus) && artist.focus.length ? artist.focus : base.focus;

  return {
    name: stringOrFallback(artist?.name, base.name),
    role: normalizeText(artist?.role, base.role),
    location: stringOrFallback(artist?.location, base.location),
    practiceSince: stringOrFallback(artist?.practiceSince, base.practiceSince),
    heroImage: stringOrFallback(artist?.heroImage, base.heroImage),
    portraitImage: stringOrFallback(artist?.portraitImage, base.portraitImage),
    portraitPosition: stringOrFallback(
      artist?.portraitPosition,
      base.portraitPosition || "center center",
    ),
    shortBio: normalizeText(artist?.shortBio, base.shortBio),
    biography: normalizeText(artist?.biography, base.biography),
    statement: normalizeText(artist?.statement, base.statement),
    galleryIntro: normalizeText(artist?.galleryIntro, base.galleryIntro),
    focus: focusSource
      .map((item) => normalizeText(item))
      .filter((item) => item.et || item.en)
      .slice(0, 8),
    artworks: artworksSource.map((artwork, index) => normalizeArtwork(artwork, index)),
  };
}

export function normalizeContent(value) {
  const content = value && typeof value === "object" ? value : cloneContent(seedContent);

  return {
    site: {
      title: stringOrFallback(content.site?.title, seedContent.site.title),
      domain: stringOrFallback(content.site?.domain, seedContent.site.domain),
      framePreset: VALID_FRAME_PRESETS.has(content.site?.framePreset)
        ? content.site.framePreset
        : seedContent.site.framePreset,
      galleryRoomSpeed: VALID_GALLERY_ROOM_SPEEDS.has(content.site?.galleryRoomSpeed)
        ? content.site.galleryRoomSpeed
        : seedContent.site.galleryRoomSpeed,
      tagline: normalizeText(content.site?.tagline, seedContent.site.tagline),
      heroLead: normalizeText(content.site?.heroLead, seedContent.site.heroLead),
      worksIntro: normalizeText(content.site?.worksIntro, seedContent.site.worksIntro),
      contactTitle: normalizeText(
        content.site?.contactTitle,
        seedContent.site.contactTitle,
      ),
      contactText: normalizeText(
        content.site?.contactText,
        seedContent.site.contactText,
      ),
    },
    contact: {
      email: stringOrFallback(content.contact?.email, seedContent.contact.email),
      phone: stringOrFallback(content.contact?.phone, seedContent.contact.phone),
      instagram: stringOrFallback(content.contact?.instagram, ""),
      instagramUrl: stringOrFallback(content.contact?.instagramUrl, ""),
    },
    artist: normalizeArtist(content.artist),
  };
}

export async function getSiteContent() {
  noStore();

  try {
    const raw = await readFile(LOCAL_PATH, "utf8");
    return normalizeContent(JSON.parse(raw));
  } catch {
    return normalizeContent(cloneContent(seedContent));
  }
}

export async function saveSiteContent(content) {
  const normalized = normalizeContent(content);
  await mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await writeFile(LOCAL_PATH, JSON.stringify(normalized, null, 2));
  return normalized;
}
