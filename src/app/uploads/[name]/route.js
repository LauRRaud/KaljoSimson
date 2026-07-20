import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Adminis üles laaditud pildid elavad kaustas uploads/ (väljaspool public/),
// sest public/ failid, mis lisanduvad PÄRAST build'i, ei ole toodangus
// garanteeritult serveeritud. See handler serveerib nad ise.
const CONTENT_TYPES = new Map([
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { name } = await params;

  // ainult uuid-stiilis failinimed — välistab igasuguse path traversal'i
  if (!/^[a-z0-9-]+\.(jpg|png|webp)$/i.test(name)) {
    return NextResponse.json({ error: "Vigane failinimi." }, { status: 400 });
  }

  const contentType = CONTENT_TYPES.get(path.extname(name).toLowerCase());

  try {
    const buffer = await readFile(path.join(process.cwd(), "uploads", name));

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Faili ei leitud." }, { status: 404 });
  }
}
