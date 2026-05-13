/* eslint-disable @next/next/no-img-element */

"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ArtworkFrame from "@/components/ArtworkFrame";
import { getCopy } from "@/lib/content-helpers";

export default function GalleryClient({ artist, locale = "et", variant = "grid" }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const roomViewportRef = useRef(null);
  const hasArtworks = artist.artworks.length > 0;
  const isRoom = variant === "room";
  const activeArtwork =
    activeIndex === null ? null : artist.artworks[activeIndex] ?? null;
  const portalRoot = typeof document === "undefined" ? null : document.body;

  function scrollRoom(direction) {
    const viewport = roomViewportRef.current;
    const wall = viewport?.querySelector(".gallery-room__wall");
    const slot = viewport?.querySelector(".gallery-room__slot");

    if (!viewport || !wall || !slot) {
      return;
    }

    const wallStyles = window.getComputedStyle(wall);
    const slotWidth = slot.getBoundingClientRect().width;
    const gap = Number.parseFloat(wallStyles.columnGap || wallStyles.gap || "0");
    const artworkStep = slotWidth + gap;
    const pairStep = artworkStep * 2;
    const isMobileLandscape = window.matchMedia(
      "(max-width: 1100px) and (max-height: 620px) and (orientation: landscape)",
    ).matches;

    viewport.scrollBy({
      left: direction * (isMobileLandscape ? artworkStep : Math.max(pairStep, viewport.clientWidth * 0.72)),
      behavior: "smooth",
    });
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

  useEffect(() => {
    if (activeIndex === null) {
      return undefined;
    }

    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, [activeIndex]);

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
                  {activeArtwork.image ? (
                    <div
                      className={`lightbox__artwork-frame ${
                        activeArtwork.frame === "ivory"
                          ? "lightbox__artwork-frame--ivory"
                          : "lightbox__artwork-frame--obsidian"
                      }`}
                    >
                      <div className="lightbox__artwork-mount">
                        <img
                          alt={
                            activeArtwork.altText ||
                            getCopy(activeArtwork.title, locale)
                          }
                          className="lightbox__artwork-image"
                          src={activeArtwork.image}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="lightbox__artwork-frame lightbox__artwork-frame--fallback">
                      <ArtworkFrame
                        artwork={activeArtwork}
                        locale={locale}
                        showCaption={false}
                      />
                    </div>
                  )}
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

                <dl className="lightbox__details">
                  {activeArtwork.year ? (
                    <div>
                      <dt>{locale === "en" ? "Year" : "Aasta"}</dt>
                      <dd>{activeArtwork.year}</dd>
                    </div>
                  ) : null}
                  {getCopy(activeArtwork.medium, locale) ? (
                    <div>
                      <dt>{locale === "en" ? "Medium" : "Tehnika"}</dt>
                      <dd>{getCopy(activeArtwork.medium, locale)}</dd>
                    </div>
                  ) : null}
                  {activeArtwork.size ? (
                    <div>
                      <dt>{locale === "en" ? "Size" : "Mõõdud"}</dt>
                      <dd>{activeArtwork.size}</dd>
                    </div>
                  ) : null}
                </dl>

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
