// @ts-check
import { expect, test } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:3000";

test("artist profile artwork lightbox covers the whole viewport", async ({ page }) => {
  await page.goto(`${baseURL}/artists/kaljo-simson?lang=et#works`);

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
  await page.goto(`${baseURL}/artists/kaljo-simson?lang=et#works`);

  await page.locator(".gallery-grid .artwork-frame--button").nth(1).click();
  const artworkFrame = page.locator(".lightbox__artwork-frame").first();
  await expect(artworkFrame).toBeVisible();

  const viewport = page.viewportSize();
  const box = await artworkFrame.boundingBox();
  const artworkCenter = (box?.x ?? 0) + (box?.width ?? 0) / 2;
  const viewportCenter = (viewport?.width ?? 0) / 2;

  expect(Math.abs(artworkCenter - viewportCenter)).toBeLessThanOrEqual(4);
});

test("tablet layout keeps artist carousel and profile portrait at readable scale", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 720 });

  await page.goto(`${baseURL}/?lang=et`);
  const carouselCard = page.locator(".artist-stage__slot--center .artist-card").first();
  await expect(carouselCard).toBeVisible();
  const carouselBox = await carouselCard.boundingBox();
  expect(carouselBox).not.toBeNull();
  expect(carouselBox?.width ?? 0).toBeLessThanOrEqual(540);

  await page.goto(`${baseURL}/artists/kaljo-simson?lang=et`);
  const portrait = page.locator(".profile-hero > .portrait-shell");
  await expect(portrait).toBeVisible();
  const portraitBox = await portrait.boundingBox();
  expect(portraitBox).not.toBeNull();
  expect(portraitBox?.width ?? 0).toBeLessThanOrEqual(620);
});

test("artwork lightbox navigation stays inside tablet and mobile viewports", async ({ page }) => {
  for (const viewport of [
    { width: 1024, height: 720 },
    { width: 486, height: 765 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${baseURL}/artists/kaljo-simson?lang=et#works`);
    await page.locator(".gallery-grid .artwork-frame--button").first().click();
    await expect(page.locator(".lightbox")).toBeVisible();

    const buttons = await page.locator(".lightbox__nav-button").all();
    expect(buttons).toHaveLength(2);

    for (const button of buttons) {
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x ?? 0).toBeGreaterThanOrEqual(0);
      expect(box?.y ?? 0).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
    }

    await page.keyboard.press("Escape");
    await expect(page.locator(".lightbox")).toBeHidden();
  }
});
