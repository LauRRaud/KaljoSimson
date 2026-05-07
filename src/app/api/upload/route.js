import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { slugify } from "@/lib/content-helpers";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;

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

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Lubatud on ainult pildifailid." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Pildifail on liiga suur. Piir on 8 MB." },
      { status: 400 },
    );
  }

  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const baseName =
    slugify(path.basename(file.name, extension)) || "beyondframes-image";
  const fileName = `${baseName}-${crypto.randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const outputPath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(outputPath, buffer);

  return NextResponse.json({
    url: `/uploads/${fileName}`,
  });
}
