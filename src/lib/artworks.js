import { unstable_noStore as noStore } from "next/cache";
import { getPrisma } from "@/lib/prisma";

const DEFAULT_FRAME = "obsidian";
const DEFAULT_PRESET = "aurora-field";

export function getUploadBaseUrl() {
  return process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || "/uploads";
}

export function artworkToGalleryItem(artwork) {
  return {
    slug: artwork.slug,
    title: artwork.title,
    year: "",
    medium: "",
    size: "",
    status: "",
    frame: DEFAULT_FRAME,
    visualPresetId: DEFAULT_PRESET,
    image: artwork.imageUrl,
    altText: artwork.altText || artwork.title,
    description: artwork.description,
  };
}

export async function getPublishedArtworks() {
  noStore();

  return getPrisma().artwork.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function getAdminArtworks() {
  noStore();

  return getPrisma().artwork.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}
