import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { unstable_noStore as noStore } from "next/cache";
import seedContent from "../../content/site-content.json";
import {
  cloneContent,
  createEmptyArtwork,
  getCopy,
  slugify,
} from "@/lib/content-helpers";
import { artworkPresets, portraitPresets } from "@/lib/visuals";

const DATA_PATH = path.join(process.cwd(), "content", "site-content.json");
const VALID_ARTWORK_PRESETS = new Set(artworkPresets.map((preset) => preset.id));
const VALID_PORTRAIT_PRESETS = new Set(
  portraitPresets.map((preset) => preset.id),
);
const VALID_FRAME_PRESETS = new Set(["silver", "gold"]);

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

function normalizeFramePreset(value) {
  return VALID_FRAME_PRESETS.has(value) ? value : "silver";
}

function normalizeText(value, fallback) {
  return {
    et: stringOrFallback(value?.et, fallback.et),
    en: stringOrFallback(value?.en, fallback.en),
  };
}

function normalizeArtwork(artwork, artistIndex, artworkIndex) {
  const fallback = createEmptyArtwork(artistIndex, artworkIndex);

  return {
    slug:
      slugify(artwork?.slug || artwork?.title?.et || fallback.slug) || fallback.slug,
    title: normalizeText(artwork?.title, fallback.title),
    year: stringOrFallback(artwork?.year, fallback.year),
    medium: normalizeText(artwork?.medium, fallback.medium),
    size: stringOrFallback(artwork?.size, fallback.size),
    status: normalizeText(artwork?.status, fallback.status),
    frame: artwork?.frame === "ivory" ? "ivory" : "obsidian",
    visualPresetId: VALID_ARTWORK_PRESETS.has(artwork?.visualPresetId)
      ? artwork.visualPresetId
      : fallback.visualPresetId,
    image: stringOrFallback(artwork?.image),
    showInGallery: booleanOrFallback(artwork?.showInGallery, fallback.showInGallery),
    galleryOrder: numberOrFallback(artwork?.galleryOrder, fallback.galleryOrder),
    description: normalizeText(artwork?.description, fallback.description),
  };
}

function normalizeArtist(artist, index) {
  const base = seedContent.artists[index % seedContent.artists.length];
  const artworksSource = Array.isArray(artist?.artworks)
    ? artist.artworks
    : base.artworks;

  return {
    slug:
      slugify(artist?.slug || artist?.name || base.slug) || `artist-${index + 1}`,
    name: stringOrFallback(artist?.name, base.name),
    location: stringOrFallback(artist?.location, base.location),
    practiceSince: stringOrFallback(artist?.practiceSince, base.practiceSince),
    portraitPresetId: VALID_PORTRAIT_PRESETS.has(artist?.portraitPresetId)
      ? artist.portraitPresetId
      : base.portraitPresetId,
    portraitImage: stringOrFallback(artist?.portraitImage),
    portraitPosition: stringOrFallback(
      artist?.portraitPosition,
      base.portraitPosition || "center center",
    ),
    role: normalizeText(artist?.role, base.role),
    shortBio: normalizeText(artist?.shortBio, base.shortBio),
    biography: normalizeText(artist?.biography, base.biography),
    statement: normalizeText(artist?.statement, base.statement),
    galleryIntro: normalizeText(artist?.galleryIntro, base.galleryIntro),
    focus:
      Array.isArray(artist?.focus) && artist.focus.length
        ? artist.focus
            .map((item) => stringOrFallback(item))
            .filter(Boolean)
            .slice(0, 8)
        : base.focus,
    artworks: artworksSource.map((artwork, artworkIndex) =>
      normalizeArtwork(artwork, index, artworkIndex),
    ),
  };
}

export function normalizeContent(value) {
  const content =
    value && typeof value === "object" ? value : cloneContent(seedContent);
  const artistsSource =
    Array.isArray(content.artists) && content.artists.length
      ? content.artists
      : seedContent.artists;

  return {
    site: {
      title: stringOrFallback(content.site?.title, seedContent.site.title),
      domain: stringOrFallback(content.site?.domain, seedContent.site.domain),
      framePreset: normalizeFramePreset(content.site?.framePreset),
      tagline: normalizeText(content.site?.tagline, seedContent.site.tagline),
      heroTitle: normalizeText(
        content.site?.heroTitle,
        seedContent.site.heroTitle,
      ),
      heroText: normalizeText(content.site?.heroText, seedContent.site.heroText),
      aboutTitle: normalizeText(
        content.site?.aboutTitle,
        seedContent.site.aboutTitle,
      ),
      aboutText: normalizeText(
        content.site?.aboutText,
        seedContent.site.aboutText,
      ),
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
      instagram: stringOrFallback(
        content.contact?.instagram,
        seedContent.contact.instagram,
      ),
      instagramUrl: stringOrFallback(
        content.contact?.instagramUrl,
        seedContent.contact.instagramUrl,
      ),
    },
    notes:
      Array.isArray(content.notes) && content.notes.length
        ? content.notes.map((note, index) =>
            normalizeText(note, seedContent.notes[index % seedContent.notes.length]),
          )
        : cloneContent(seedContent.notes),
    artists: artistsSource.map((artist, index) => normalizeArtist(artist, index)),
  };
}

async function ensureDataFile(content) {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(normalizeContent(content), null, 2));
}

export async function getSiteContent() {
  noStore();

  try {
    const raw = await readFile(DATA_PATH, "utf8");
    return normalizeContent(JSON.parse(raw));
  } catch {
    const fallback = cloneContent(seedContent);
    await ensureDataFile(fallback);
    return fallback;
  }
}

export async function saveSiteContent(content) {
  const normalized = normalizeContent(content);
  await ensureDataFile(normalized);
  return normalized;
}

export async function getDemoContent() {
  return cloneContent(seedContent);
}

export async function getArtistSeoSummary(slug) {
  const content = await getSiteContent();
  const artist = content.artists.find((entry) => entry.slug === slug);

  if (!artist) {
    return null;
  }

  return {
    title: artist.name,
    description: getCopy(artist.shortBio),
  };
}
