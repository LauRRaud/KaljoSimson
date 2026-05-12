"use server";

import path from "node:path";
import { unlink } from "node:fs/promises";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { slugify } from "@/lib/content-helpers";
import { getPrisma } from "@/lib/prisma";

function getUploadDir() {
  return process.env.UPLOAD_DIR || "uploads";
}

function requiredString(formData, field) {
  const value = String(formData.get(field) || "").trim();

  if (!value) {
    throw new Error(`Väli "${field}" on kohustuslik.`);
  }

  return value;
}

function optionalString(formData, field) {
  return String(formData.get(field) || "").trim();
}

function numberFromForm(formData, field, fallback = 0) {
  const value = Number.parseInt(String(formData.get(field) || ""), 10);
  return Number.isFinite(value) ? value : fallback;
}

function revalidateArtworkViews() {
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/artworks");
  revalidatePath("/artists/[slug]", "page");
  revalidatePath("/artists/[slug]/gallery", "page");
}

function artworkDataFromForm(formData, { requireImage }) {
  const title = requiredString(formData, "title");
  const rawSlug = optionalString(formData, "slug");
  const slug = slugify(rawSlug || title);
  const filename = optionalString(formData, "filename");
  const imageUrl = optionalString(formData, "imageUrl");

  if (!slug) {
    throw new Error("Slug puudub.");
  }

  if (requireImage && (!filename || !imageUrl)) {
    throw new Error("Pilt puudub. Laadi enne salvestamist pilt üles.");
  }

  const data = {
    title,
    slug,
    description: optionalString(formData, "description"),
    altText: optionalString(formData, "altText") || title,
    sortOrder: numberFromForm(formData, "sortOrder"),
    isPublished: formData.get("isPublished") === "on",
  };

  if (filename || imageUrl) {
    data.imageUrl = requiredString(formData, "imageUrl");
    data.filename = requiredString(formData, "filename");
    data.originalName = requiredString(formData, "originalName");
    data.mimeType = requiredString(formData, "mimeType");
    data.size = numberFromForm(formData, "size");
  }

  return data;
}

async function deleteUploadedFile(filename) {
  const safeName = path.basename(String(filename || ""));

  if (!safeName || safeName !== filename) {
    return;
  }

  const targetPath = path.join(/*turbopackIgnore: true*/ getUploadDir(), safeName);

  try {
    await unlink(targetPath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Admin sessioon puudub. Logi uuesti sisse.");
  }
}

export async function createArtworkAction(formData) {
  await requireAdmin();

  const artwork = await getPrisma().artwork.create({
    data: artworkDataFromForm(formData, { requireImage: true }),
  });

  revalidateArtworkViews();

  return {
    ok: true,
    message: "Kunstiteos lisati.",
    artwork,
  };
}

export async function updateArtworkAction(formData) {
  await requireAdmin();

  const id = requiredString(formData, "id");
  const previous = await getPrisma().artwork.findUnique({
    where: {
      id,
    },
  });

  if (!previous) {
    throw new Error("Kunstiteost ei leitud.");
  }

  const data = artworkDataFromForm(formData, { requireImage: false });
  const artwork = await getPrisma().artwork.update({
    where: {
      id,
    },
    data,
  });

  if (data.filename && data.filename !== previous.filename) {
    await deleteUploadedFile(previous.filename);
  }

  revalidateArtworkViews();

  return {
    ok: true,
    message: "Kunstiteos salvestati.",
    artwork,
  };
}

export async function deleteArtworkAction(formData) {
  await requireAdmin();

  const id = requiredString(formData, "id");
  const artwork = await getPrisma().artwork.delete({
    where: {
      id,
    },
  });

  await deleteUploadedFile(artwork.filename);
  revalidateArtworkViews();

  return {
    ok: true,
    message: "Kunstiteos kustutati.",
  };
}
