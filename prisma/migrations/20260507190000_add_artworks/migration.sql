CREATE TABLE "Artwork" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "altText" TEXT NOT NULL DEFAULT '',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Artwork_slug_key" ON "Artwork"("slug");
CREATE INDEX "Artwork_isPublished_sortOrder_idx" ON "Artwork"("isPublished", "sortOrder");
