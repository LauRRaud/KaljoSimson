// @ts-check
import { expect, test } from "@playwright/test";

test("artist profile artwork lightbox covers the whole viewport", async ({ page }) => {
  await page.goto("http://localhost:3000/artists/kaljo-simson?lang=et#works");

  const firstArtwork = page.locator(".gallery-grid .artwork-frame--button").first();
  await expect(firstArtwork).toBeVisible();
  await firstArtwork.click();

  const lightbox = page.locator(".lightbox");
  await expect(lightbox).toBeVisible();

  const viewport = page.viewportSize();
  const box = await lightbox.boundingBox();

  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();
  expect(box?.x).toBe(0);
  expect(box?.y).toBe(0);
  expect(Math.round(box?.width ?? 0)).toBe(viewport?.width);
  expect(Math.round(box?.height ?? 0)).toBe(viewport?.height);
});

test("mobile artwork is centered in the lightbox viewport", async ({ page }) => {
  await page.setViewportSize({ width: 486, height: 765 });
  await page.goto("http://localhost:3000/artists/kaljo-simson?lang=et#works");

  await page.locator(".gallery-grid .artwork-frame--button").nth(1).click();
  const artworkFrame = page.locator(".lightbox__artwork-frame").first();
  await expect(artworkFrame).toBeVisible();

  const viewport = page.viewportSize();
  const box = await artworkFrame.boundingBox();
  const artworkCenter = (box?.x ?? 0) + (box?.width ?? 0) / 2;
  const viewportCenter = (viewport?.width ?? 0) / 2;

  expect(Math.abs(artworkCenter - viewportCenter)).toBeLessThanOrEqual(4);
});
