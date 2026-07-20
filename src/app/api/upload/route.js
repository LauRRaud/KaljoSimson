import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const MAX_SIZE_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export const runtime = "nodejs";

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admini sessioon puudub." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Pildifail puudub." }, { status: 400 });
  }

  const mimeType = String(file.type || "").toLowerCase();
  const extension = ALLOWED_TYPES.get(mimeType);

  if (!extension) {
    return NextResponse.json(
      { error: "Lubatud on ainult jpg, png ja webp pildifailid." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Pildifail on liiga suur. Piir on 12 MB." },
      { status: 400 },
    );
  }

  const fileName = `${crypto.randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "uploads");
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return NextResponse.json({ url: `/uploads/${fileName}` });
}
