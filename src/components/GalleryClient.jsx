/* eslint-disable @next/next/no-img-element */

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ArtworkFrame from "@/components/ArtworkFrame";
import { getCopy } from "@/lib/content-helpers";

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
  const decodedRoomImagesRef = useRef(new Set());
  const roomViewportRef = useRef(null);
  const roomTravelFrameRef = useRef(null);
  const hasArtworks = artist.artworks.length > 0;
  const isRoom = variant === "room";
  const roomTravelDuration = 3200;
  const activeArtwork =
    activeIndex === null ? null : artist.artworks[activeIndex] ?? null;
  const portalRoot = typeof document === "undefined" ? null : document.body;
  const yearLabel = locale === "en" ? "Year" : "Aasta";
  const mediumLabel = locale === "en" ? "Medium" : "Tehnika";
  const sizeLabel = locale === "en" ? "Size" : "Mõõdud";
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

  useEffect(() => {
    if (!hasArtworks || activeIndex === null) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % artist.artworks.length,
        );
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null
            ? current
            : (current - 1 + artist.artworks.length) % artist.artworks.length,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, artist.artworks.length, hasArtworks]);

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
                    onClick={() => setActiveIndex(index)}
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
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}

      {portalRoot && activeArtwork ? createPortal(
        <div
          aria-modal="true"
          className="lightbox"
          onClick={() => setActiveIndex(null)}
          role="dialog"
        >
          <div
            className="lightbox__sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lightbox__grid">
              <figure className="lightbox__figure">
                <div className="lightbox__image-window">
                  <div className="lightbox__artwork-frame">
                    <ArtworkFrame
                      artwork={activeArtwork}
                      locale={locale}
                      showCaption={false}
                    />
                  </div>
                </div>
              </figure>

              <aside className="lightbox__aside">
                <button
                  aria-label={locale === "en" ? "Close artwork view" : "Sulge teose vaade"}
                  className="lightbox__close"
                  onClick={() => setActiveIndex(null)}
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
                      setActiveIndex(
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
                      setActiveIndex((activeIndex + 1) % artist.artworks.length)
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
