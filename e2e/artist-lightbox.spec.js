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

test("artwork lightbox magnifier reveals a movable detail lens", async ({ page }) => {
  await page.goto(`${baseURL}/artists/kaljo-simson?lang=et#works`);

  await page.locator(".gallery-grid .artwork-frame--button").first().click();
  await expect(page.locator(".lightbox")).toBeVisible();

  const magnifierToggle = page.getByRole("button", { name: "Ava luup" });
  await expect(magnifierToggle).toBeVisible();
  await magnifierToggle.click();
  await expect(magnifierToggle).toHaveAttribute("aria-pressed", "true");

  const lens = page.locator(".lightbox__magnifier-lens");
  await expect(lens).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/is-magnifying-artwork/);

  const image = page.locator(".lightbox__artwork-frame .artwork-frame__image");
  const imageBox = await image.boundingBox();
  expect(imageBox).not.toBeNull();

  const toggleBox = await magnifierToggle.boundingBox();
  const initialLensBox = await lens.boundingBox();
  expect(toggleBox).not.toBeNull();
  expect(initialLensBox).not.toBeNull();
  expect(toggleBox?.x ?? 0).toBeGreaterThanOrEqual(0);
  expect((toggleBox?.x ?? 0) + (toggleBox?.width ?? 0)).toBeLessThan(
    imageBox?.x ?? 0,
  );
  const toggleCenterX = (toggleBox?.x ?? 0) + (toggleBox?.width ?? 0) / 2;
  const toggleCenterY = (toggleBox?.y ?? 0) + (toggleBox?.height ?? 0) / 2;
  const lensCenterX = (initialLensBox?.x ?? 0) + (initialLensBox?.width ?? 0) / 2;
  const lensCenterY = (initialLensBox?.y ?? 0) + (initialLensBox?.height ?? 0) / 2;
  expect(Math.abs(lensCenterX - toggleCenterX)).toBeLessThanOrEqual(2);
  expect(Math.abs(lensCenterY - toggleCenterY)).toBeLessThanOrEqual(2);
  await expect(page.locator(".lightbox__image-window")).toHaveCSS("cursor", "none");

  await page.mouse.move(
    (imageBox?.x ?? 0) + (imageBox?.width ?? 0) * 0.62,
    (imageBox?.y ?? 0) + (imageBox?.height ?? 0) * 0.42,
  );

  const backgroundSize = await lens.evaluate((element) => {
    const [width] = window.getComputedStyle(element).backgroundSize.split(" ");
    return Number.parseFloat(width);
  });
  expect(backgroundSize).toBeGreaterThan((imageBox?.width ?? 0) * 2.1);
  expect(backgroundSize).toBeLessThan((imageBox?.width ?? 0) * 2.3);
  await expect(lens).toHaveCSS("opacity", "1");

  await page.keyboard.press("Escape");
  await expect(page.locator(".lightbox")).toBeVisible();
  await expect(lens).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/is-magnifying-artwork/);

  await magnifierToggle.click();
  await expect(lens).toBeVisible();
  await page.mouse.click(
    (imageBox?.x ?? 0) + (imageBox?.width ?? 0) * 0.5,
    (imageBox?.y ?? 0) + (imageBox?.height ?? 0) * 0.5,
  );
  await expect(lens).toBeHidden();
  await expect(page.locator(".lightbox")).toBeVisible();
});

test("mobile artist gallery artworks stay inside the viewport", async ({ page }) => {
  const viewport = { width: 486, height: 765 };
  await page.setViewportSize(viewport);
  await page.goto(`${baseURL}/artists/kaljo-simson?lang=et#works`);

  const artwork = page.locator(".gallery-grid .artwork-frame--button").first();
  await expect(artwork).toBeVisible();

  const box = await artwork.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.x ?? 0).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
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

    if (viewport.width === 486) {
      const yearRow = page.locator(".lightbox__details-row--year");
      const sizeRow = page.locator(".lightbox__details-row--size");
      await expect(yearRow).toBeVisible();
      await expect(sizeRow).toBeVisible();

      const yearBox = await yearRow.boundingBox();
      const sizeBox = await sizeRow.boundingBox();
      expect(yearBox).not.toBeNull();
      expect(sizeBox).not.toBeNull();
      expect(Math.abs((yearBox?.y ?? 0) - (sizeBox?.y ?? 0))).toBeLessThanOrEqual(1);
    }

    await page.keyboard.press("Escape");
    await expect(page.locator(".lightbox")).toBeHidden();
  }
});
