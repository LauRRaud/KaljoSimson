/* eslint-disable @next/next/no-img-element */

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ArtworkFrame from "@/components/ArtworkFrame";
import { getCopy } from "@/lib/content-helpers";

const defaultMagnifierPosition = {
  x: 50,
  y: 50,
  left: "50%",
  top: "50%",
  backgroundWidth: "220%",
  backgroundHeight: "auto",
  backgroundX: "50%",
  backgroundY: "50%",
};
const magnifierZoom = 2.2;

function compactMetaValue(value) {
  const normalized = String(value ?? "").trim().toLocaleLowerCase("et-EE");
  const placeholders = new Set([
    "",
    "dateerimata",
    "undated",
    "meedium täpsustamisel",
    "medium to be confirmed",
    "mõõdud täpsustamisel",
    "dimensions to be confirmed",
    "size to be confirmed",
  ]);

  return placeholders.has(normalized) ? null : value;
}

function renderMetaValue(value) {
  return compactMetaValue(value) ?? "—";
}

function waitForImageDecode(src) {
  if (!src || typeof window === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const image = new window.Image();

    image.onload = async () => {
      if (typeof image.decode !== "function") {
        resolve();
        return;
      }

      try {
        await image.decode();
      } catch {
        // Decode can reject for cached or unsupported images; loaded image is still usable.
      }

      resolve();
    };
    image.onerror = () => resolve();
    image.src = src;
  });
}

export default function GalleryClient({ artist, locale = "et", variant = "grid" }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState(defaultMagnifierPosition);
  const decodedRoomImagesRef = useRef(new Set());
  const lightboxImageWindowRef = useRef(null);
  const roomViewportRef = useRef(null);
  const roomTravelFrameRef = useRef(null);
  const magnifierTouchRef = useRef({
    lastTapAt: 0,
    lastTapX: 0,
    lastTapY: 0,
    moved: false,
    startX: 0,
    startY: 0,
  });
  const hasArtworks = artist.artworks.length > 0;
  const isRoom = variant === "room";
  const roomTravelDuration = 3200;
  const activeArtwork =
    activeIndex === null ? null : artist.artworks[activeIndex] ?? null;
  const portalRoot = typeof document === "undefined" ? null : document.body;
  const yearLabel = locale === "en" ? "Year" : "Aasta";
  const mediumLabel = locale === "en" ? "Medium" : "Tehnika";
  const sizeLabel = locale === "en" ? "Size" : "Mõõdud";
  const magnifierLabel = locale === "en" ? "Open magnifier" : "Ava luup";
  const artworkMeta = activeArtwork
    ? [
        {
          key: "medium",
          label: mediumLabel,
          value: renderMetaValue(getCopy(activeArtwork.medium, locale)),
        },
        {
          key: "year",
          label: yearLabel,
          value: renderMetaValue(activeArtwork.year),
        },
        {
          key: "size",
          label: sizeLabel,
          value: renderMetaValue(activeArtwork.size),
        },
      ]
    : [];
  const magnifierLensStyle = activeArtwork?.image
    ? {
        "--magnifier-x": `${magnifierPosition.x}%`,
        "--magnifier-y": `${magnifierPosition.y}%`,
        "--magnifier-left": magnifierPosition.left,
        "--magnifier-top": magnifierPosition.top,
        "--magnifier-bg-width": magnifierPosition.backgroundWidth,
        "--magnifier-bg-height": magnifierPosition.backgroundHeight,
        "--magnifier-bg-x": magnifierPosition.backgroundX,
        "--magnifier-bg-y": magnifierPosition.backgroundY,
        backgroundImage: `url("${activeArtwork.image}")`,
      }
    : undefined;

  function easeRoomScroll(progress) {
    return 0.5 - Math.cos(progress * Math.PI) / 2;
  }

  function getRoomImageSources(startIndex, visibleCount = 1, radius = 1) {
    const start = Math.max(0, startIndex - radius * visibleCount);
    const end = Math.min(
      artist.artworks.length,
      startIndex + visibleCount + radius * visibleCount,
    );

    return artist.artworks
      .slice(start, end)
      .map((artwork) => artwork.image)
      .filter(Boolean);
  }

  async function predecodeRoomImages(sources) {
    const pendingSources = sources.filter(
      (source) => !decodedRoomImagesRef.current.has(source),
    );

    if (!pendingSources.length) {
      return;
    }

    pendingSources.forEach((source) => decodedRoomImagesRef.current.add(source));
    await Promise.all(pendingSources.map((source) => waitForImageDecode(source)));
  }

  function animateRoomScrollTo(target) {
    const viewport = roomViewportRef.current;

    if (!viewport) {
      return;
    }

    if (roomTravelFrameRef.current !== null) {
      window.cancelAnimationFrame(roomTravelFrameRef.current);
    }

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const clampedTarget = Math.min(maxScrollLeft, Math.max(0, target));
    const startScrollLeft = viewport.scrollLeft;
    const travelDistance = clampedTarget - startScrollLeft;

    if (Math.abs(travelDistance) < 1) {
      viewport.scrollLeft = clampedTarget;
      roomTravelFrameRef.current = null;
      return;
    }

    const startedAt = window.performance.now();

    const step = (timestamp) => {
      const progress = Math.min(1, (timestamp - startedAt) / roomTravelDuration);
      const easedProgress = easeRoomScroll(progress);
      viewport.scrollLeft = startScrollLeft + travelDistance * easedProgress;

      if (progress < 1) {
        roomTravelFrameRef.current = window.requestAnimationFrame(step);
        return;
      }

      roomTravelFrameRef.current = null;
    };

    roomTravelFrameRef.current = window.requestAnimationFrame(step);
  }

  function getRoomSlots(viewport) {
    return Array.from(viewport?.querySelectorAll(".gallery-room__slot") ?? []);
  }

  function getRoomScrollStep(viewport, slots) {
    if (!viewport || slots.length < 2) {
      return 1;
    }

    const viewportStyles = window.getComputedStyle(viewport);
    const paddingLeft = Number.parseFloat(viewportStyles.paddingLeft || "0");
    const paddingRight = Number.parseFloat(viewportStyles.paddingRight || "0");
    const visibleWidth = viewport.clientWidth - paddingLeft - paddingRight;
    const firstSlotRect = slots[0].getBoundingClientRect();
    const secondSlotRect = slots[1].getBoundingClientRect();
    const twoSlotSpan = secondSlotRect.right - firstSlotRect.left;

    return visibleWidth + 1 >= twoSlotSpan ? 2 : 1;
  }

  function getCurrentRoomStartIndex(viewport, slots, step) {
    if (!viewport || slots.length === 0) {
      return 0;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const viewportStyles = window.getComputedStyle(viewport);
    const focusLeft = viewportRect.left + Number.parseFloat(viewportStyles.paddingLeft || "0");
    let closestPairStartIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < slots.length; index += step) {
      const distance = Math.abs(slots[index].getBoundingClientRect().left - focusLeft);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestPairStartIndex = index;
      }
    }

    return closestPairStartIndex;
  }

  function getRoomScrollTarget(viewport, slots, startIndex) {
    const firstSlot = slots[startIndex];
    const viewportRect = viewport.getBoundingClientRect();
    const viewportStyles = window.getComputedStyle(viewport);
    const focusLeft = viewportRect.left + Number.parseFloat(viewportStyles.paddingLeft || "0");

    return viewport.scrollLeft + firstSlot.getBoundingClientRect().left - focusLeft;
  }

  async function scrollRoom(direction) {
    const viewport = roomViewportRef.current;
    const wall = viewport?.querySelector(".gallery-room__wall");

    if (!viewport || !wall) {
      return;
    }

    const slots = getRoomSlots(viewport);

    if (slots.length === 0) {
      return;
    }

    const scrollStep = getRoomScrollStep(viewport, slots);
    const currentStartIndex = getCurrentRoomStartIndex(viewport, slots, scrollStep);
    const remainder = slots.length % scrollStep;
    const maxStartIndex = Math.max(
      0,
      slots.length - (remainder === 0 ? scrollStep : remainder),
    );
    const targetIndex = Math.min(
      maxStartIndex,
      Math.max(0, currentStartIndex + direction * scrollStep),
    );
    const targetScrollLeft = getRoomScrollTarget(viewport, slots, targetIndex);

    await predecodeRoomImages(getRoomImageSources(targetIndex, scrollStep));
    animateRoomScrollTo(targetScrollLeft);
  }

  function updateMagnifierPosition(event) {
    if (!isMagnifierActive) {
      return;
    }

    if (event.pointerType === "touch") {
      const distance = Math.hypot(
        event.clientX - magnifierTouchRef.current.startX,
        event.clientY - magnifierTouchRef.current.startY,
      );

      if (distance > 8) {
        magnifierTouchRef.current.moved = true;
      }
    }

    const imageWindow = lightboxImageWindowRef.current;
    const image = imageWindow?.querySelector(".artwork-frame__image");

    if (!imageWindow || !image) {
      return;
    }

    setMagnifierPosition(
      getMagnifierPositionFromPoint({
        image,
        imageWindow,
        lensClientX: event.clientX,
        lensClientY: event.clientY,
        sourceClientX: event.clientX,
        sourceClientY: event.clientY,
      }),
    );
  }

  function handleMagnifierPointerDown(event) {
    if (!isMagnifierActive) {
      return;
    }

    if (event.target.closest?.(".lightbox__magnifier-toggle")) {
      return;
    }

    if (event.pointerType === "touch") {
      event.preventDefault();
      magnifierTouchRef.current.startX = event.clientX;
      magnifierTouchRef.current.startY = event.clientY;
      magnifierTouchRef.current.moved = false;
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } catch {
        // Some synthetic pointer events cannot be captured; position updates still work.
      }
      updateMagnifierPosition(event);
      return;
    }

    setIsMagnifierActive(false);
    setMagnifierPosition(defaultMagnifierPosition);
  }

  function handleMagnifierPointerUp(event) {
    if (!isMagnifierActive || event.pointerType !== "touch") {
      return;
    }

    event.preventDefault();
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      // Ignore release attempts for pointers the browser did not capture.
    }

    if (magnifierTouchRef.current.moved) {
      magnifierTouchRef.current.lastTapAt = 0;
      return;
    }

    const now = window.performance.now();
    const tapDistance = Math.hypot(
      event.clientX - magnifierTouchRef.current.lastTapX,
      event.clientY - magnifierTouchRef.current.lastTapY,
    );
    const isDoubleTap =
      now - magnifierTouchRef.current.lastTapAt < 320 && tapDistance < 34;

    if (isDoubleTap) {
      setIsMagnifierActive(false);
      setMagnifierPosition(defaultMagnifierPosition);
      magnifierTouchRef.current.lastTapAt = 0;
      return;
    }

    magnifierTouchRef.current.lastTapAt = now;
    magnifierTouchRef.current.lastTapX = event.clientX;
    magnifierTouchRef.current.lastTapY = event.clientY;
  }

  function handleMagnifierPointerCancel(event) {
    if (event.pointerType !== "touch") {
      return;
    }

    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      // Ignore release attempts for pointers the browser did not capture.
    }
    magnifierTouchRef.current.moved = false;
  }

  function getMagnifierPositionFromPoint({
    imageWindow,
    image,
    lensClientX,
    lensClientY,
    sourceClientX,
    sourceClientY,
  }) {
    const imageRect = image.getBoundingClientRect();
    const windowRect = imageWindow.getBoundingClientRect();
    const clampedClientX = Math.min(
      imageRect.right,
      Math.max(imageRect.left, sourceClientX),
    );
    const clampedClientY = Math.min(
      imageRect.bottom,
      Math.max(imageRect.top, sourceClientY),
    );
    const sourceX = clampedClientX - imageRect.left;
    const sourceY = clampedClientY - imageRect.top;
    const x = Math.min(
      100,
      Math.max(0, (sourceX / imageRect.width) * 100),
    );
    const y = Math.min(
      100,
      Math.max(0, (sourceY / imageRect.height) * 100),
    );
    const lens = imageWindow.querySelector(".lightbox__magnifier-lens");
    const lensRect = lens?.getBoundingClientRect();
    const lensCenterX = (lensRect?.width ?? 174) / 2;
    const lensCenterY = (lensRect?.height ?? 174) / 2;

    return {
      x,
      y,
      left: `${lensClientX - windowRect.left}px`,
      top: `${lensClientY - windowRect.top}px`,
      backgroundWidth: `${imageRect.width * magnifierZoom}px`,
      backgroundHeight: `${imageRect.height * magnifierZoom}px`,
      backgroundX: `${lensCenterX - sourceX * magnifierZoom}px`,
      backgroundY: `${lensCenterY - sourceY * magnifierZoom}px`,
    };
  }

  function getCenteredMagnifierPosition() {
    const imageWindow = lightboxImageWindowRef.current;
    const image = imageWindow?.querySelector(".artwork-frame__image");

    if (!imageWindow || !image) {
      return defaultMagnifierPosition;
    }

    const imageRect = image.getBoundingClientRect();

    return getMagnifierPositionFromPoint({
      imageWindow,
      image,
      lensClientX: imageRect.left + imageRect.width / 2,
      lensClientY: imageRect.top + imageRect.height / 2,
      sourceClientX: imageRect.left + imageRect.width / 2,
      sourceClientY: imageRect.top + imageRect.height / 2,
    });
  }

  function getMagnifierPositionByToggle(toggle) {
    const imageWindow = lightboxImageWindowRef.current;
    const image = imageWindow?.querySelector(".artwork-frame__image");

    if (!imageWindow || !image || !toggle) {
      return getCenteredMagnifierPosition();
    }

    const toggleRect = toggle.getBoundingClientRect();
    const toggleCenterX = toggleRect.left + toggleRect.width / 2;
    const toggleCenterY = toggleRect.top + toggleRect.height / 2;

    return getMagnifierPositionFromPoint({
      imageWindow,
      image,
      lensClientX: toggleCenterX,
      lensClientY: toggleCenterY,
      sourceClientX: toggleCenterX,
      sourceClientY: toggleCenterY,
    });
  }

  function toggleMagnifier(event) {
    const toggle = event.currentTarget;

    setIsMagnifierActive((current) => {
      const next = !current;

      if (next) {
        setMagnifierPosition(getMagnifierPositionByToggle(toggle));
      }

      return next;
    });
  }

  function resetMagnifier() {
    setIsMagnifierActive(false);
    setMagnifierPosition(defaultMagnifierPosition);
  }

  function openLightbox(index) {
    resetMagnifier();
    setActiveIndex(index);
  }

  function closeLightbox() {
    resetMagnifier();
    setActiveIndex(null);
  }

  function showLightboxIndex(index) {
    resetMagnifier();
    setActiveIndex(index);
  }

  useEffect(() => {
    if (!hasArtworks || activeIndex === null) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (isMagnifierActive) {
          event.preventDefault();
          setIsMagnifierActive(false);
          setMagnifierPosition(defaultMagnifierPosition);
          return;
        }

        setIsMagnifierActive(false);
        setMagnifierPosition(defaultMagnifierPosition);
        setActiveIndex(null);
      }

      if (event.key === "ArrowRight") {
        setIsMagnifierActive(false);
        setMagnifierPosition(defaultMagnifierPosition);
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % artist.artworks.length,
        );
      }

      if (event.key === "ArrowLeft") {
        setIsMagnifierActive(false);
        setMagnifierPosition(defaultMagnifierPosition);
        setActiveIndex((current) =>
          current === null
            ? current
            : (current - 1 + artist.artworks.length) % artist.artworks.length,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, artist.artworks.length, hasArtworks, isMagnifierActive]);

  useEffect(() => {
    document.body.classList.toggle("is-magnifying-artwork", isMagnifierActive);

    return () => {
      document.body.classList.remove("is-magnifying-artwork");
    };
  }, [isMagnifierActive]);

  useLayoutEffect(() => {
    if (activeIndex === null) {
      return undefined;
    }

    const scrollY = window.scrollY;
    const root = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const previousScrollBehavior = root.style.scrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);

      window.requestAnimationFrame(() => {
        root.style.scrollBehavior = previousScrollBehavior;
      });
    };
  }, [activeIndex]);

  useEffect(() => () => {
    if (roomTravelFrameRef.current !== null) {
      window.cancelAnimationFrame(roomTravelFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isRoom || !hasArtworks) {
      return undefined;
    }

    let cancelled = false;
    const immediateSources = getRoomImageSources(0);
    const remainingSources = artist.artworks
      .map((artwork) => artwork.image)
      .filter(Boolean)
      .filter((source) => !immediateSources.includes(source));

    predecodeRoomImages(immediateSources);

    function decodeNextIdleImage() {
      if (cancelled || !remainingSources.length) {
        return;
      }

      const nextSource = remainingSources.shift();

      predecodeRoomImages([nextSource]).finally(() => {
        if (cancelled) {
          return;
        }

        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(decodeNextIdleImage, { timeout: 1600 });
          return;
        }

        window.setTimeout(decodeNextIdleImage, 240);
      });
    }

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(decodeNextIdleImage, { timeout: 1600 });
    } else {
      window.setTimeout(decodeNextIdleImage, 240);
    }

    return () => {
      cancelled = true;
    };
  }, [artist.artworks, hasArtworks, isRoom]);

  if (!hasArtworks) {
    return (
      <div className="empty-state">
        <p className="section-copy">
          {locale === "en" ? "No works have been added yet." : "Teoseid ei ole veel lisatud."}
        </p>
      </div>
    );
  }

  return (
    <>
      {isRoom ? (
        <section
          aria-label={locale === "en" ? "Gallery room" : "Galeriiruum"}
          className="gallery-room"
        >
          <div className="gallery-room__viewport" ref={roomViewportRef}>
            <div className="gallery-room__wall">
              {artist.artworks.map((artwork, index) => (
                <div className="gallery-room__slot" key={artwork.slug}>
                  <ArtworkFrame
                    artwork={artwork}
                    imageFetchPriority={index < 2 ? "high" : undefined}
                    imageLoading={index < 4 ? "eager" : "lazy"}
                    interactive
                    locale={locale}
                    onClick={() => openLightbox(index)}
                  />
                </div>
              ))}
            </div>
          </div>

          {artist.artworks.length > 1 ? (
            <div className="gallery-room__controls">
              <button
                aria-label={locale === "en" ? "Move left in gallery" : "Liigu galeriis vasakule"}
                className="gallery-room__nav gallery-room__nav--prev"
                onClick={() => scrollRoom(-1)}
                type="button"
              >
                <span aria-hidden="true">&lt;</span>
              </button>
              <button
                aria-label={locale === "en" ? "Move right in gallery" : "Liigu galeriis paremale"}
                className="gallery-room__nav gallery-room__nav--next"
                onClick={() => scrollRoom(1)}
                type="button"
              >
                <span aria-hidden="true">&gt;</span>
              </button>
            </div>
          ) : null}
        </section>
      ) : (
        <div className="gallery-grid">
          {artist.artworks.map((artwork, index) => (
            <ArtworkFrame
              artwork={artwork}
              imageFetchPriority={index < 2 ? "high" : undefined}
              imageLoading={index < 4 ? "eager" : "lazy"}
              interactive
              key={artwork.slug}
              locale={locale}
              onClick={() => openLightbox(index)}
            />
          ))}
        </div>
      )}

      {portalRoot && activeArtwork ? createPortal(
        <div
          aria-modal="true"
          className="lightbox"
          onClick={closeLightbox}
          role="dialog"
        >
          <div
            className="lightbox__sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lightbox__grid">
              <figure className="lightbox__figure">
                <div
                  className={`lightbox__image-window ${
                    isMagnifierActive ? "lightbox__image-window--magnifying" : ""
                  }`}
                  onPointerDown={handleMagnifierPointerDown}
                  onPointerMove={updateMagnifierPosition}
                  onPointerUp={handleMagnifierPointerUp}
                  onPointerCancel={handleMagnifierPointerCancel}
                  ref={lightboxImageWindowRef}
                >
                  <div className="lightbox__artwork-frame">
                    <ArtworkFrame
                      artwork={activeArtwork}
                      locale={locale}
                      showCaption={false}
                    />
                    {activeArtwork.image ? (
                      <button
                        aria-label={magnifierLabel}
                        aria-pressed={isMagnifierActive}
                        className="lightbox__magnifier-toggle"
                        onClick={toggleMagnifier}
                        onPointerDown={(event) => event.stopPropagation()}
                        type="button"
                      >
                        <span>{magnifierLabel}</span>
                      </button>
                    ) : null}
                  </div>
                  {isMagnifierActive && activeArtwork.image ? (
                    <div
                      aria-hidden="true"
                      className="lightbox__magnifier-lens"
                      style={magnifierLensStyle}
                    />
                  ) : null}
                </div>
              </figure>

              <aside className="lightbox__aside">
                <button
                  aria-label={locale === "en" ? "Close artwork view" : "Sulge teose vaade"}
                  className="lightbox__close"
                  onClick={closeLightbox}
                  type="button"
                >
                  <span aria-hidden="true">×</span>
                </button>

                <div className="lightbox__caption">
                  <p className="eyebrow">{activeArtwork.artistName || artist.name}</p>
                  <h2>{getCopy(activeArtwork.title, locale)}</h2>
                  <p className="inline-copy">
                    {getCopy(activeArtwork.description, locale)}
                  </p>
                </div>

                {artworkMeta.length ? (
                  <dl className="lightbox__details">
                    {artworkMeta.map((item) => (
                      <div
                        className={`lightbox__details-row lightbox__details-row--${item.key}`}
                        key={item.key}
                      >
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <div className="lightbox__actions">
                  <button
                    className="lightbox__nav-button"
                    onClick={() =>
                      showLightboxIndex(
                        (activeIndex - 1 + artist.artworks.length) %
                          artist.artworks.length,
                      )
                    }
                    type="button"
                  >
                    {locale === "en" ? "Previous" : "Eelmine"}
                  </button>
                  <button
                    className="lightbox__nav-button"
                    onClick={() =>
                      showLightboxIndex((activeIndex + 1) % artist.artworks.length)
                    }
                    type="button"
                  >
                    {locale === "en" ? "Next" : "Järgmine"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>,
        portalRoot,
      ) : null}
    </>
  );
}
