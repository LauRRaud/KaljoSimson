import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export const runtime = "nodejs";

function getUploadDir() {
  return process.env.UPLOAD_DIR || "uploads";
}

function getUploadBaseUrl() {
  return process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || "/uploads";
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Admin sessioon puudub." },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Pildifail puudub." },
      { status: 400 },
    );
  }

  const mimeType = String(file.type || "").toLowerCase();
  const originalExtension = path.extname(file.name).toLowerCase();
  const extension = ALLOWED_TYPES.get(mimeType);
  const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

  if (!extension || !allowedExtensions.has(originalExtension)) {
    return NextResponse.json(
      { error: "Lubatud on ainult jpg, jpeg, png ja webp pildifailid." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Pildifail on liiga suur. Piir on 8 MB." },
      { status: 400 },
    );
  }

  const fileName = `${crypto.randomUUID()}${extension}`;
  const uploadDir = getUploadDir();
  const outputPath = path.join(/*turbopackIgnore: true*/ uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(outputPath, buffer);

  const url = `${getUploadBaseUrl().replace(/\/$/, "")}/${fileName}`;

  return NextResponse.json({
    url,
    imageUrl: url,
    filename: fileName,
    originalName: file.name,
    mimeType,
    size: file.size,
  });
}
