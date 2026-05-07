"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ArtworkFrame from "@/components/ArtworkFrame";
import { getCopy } from "@/lib/content-helpers";

export default function GalleryClient({ artist, locale = "et" }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const hasArtworks = artist.artworks.length > 0;
  const activeArtwork =
    activeIndex === null ? null : artist.artworks[activeIndex] ?? null;

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

      {activeArtwork ? (
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
            <button
              aria-label={locale === "en" ? "Close artwork view" : "Sulge teose vaade"}
              className="lightbox__close"
              onClick={() => setActiveIndex(null)}
              type="button"
            >
              x
            </button>

            <div className="lightbox__grid">
              <figure className="lightbox__figure">
                <div className="lightbox__image-window">
                  {activeArtwork.image ? (
                    <Image
                      alt={getCopy(activeArtwork.title, locale)}
                      className="lightbox__image"
                      fill
                      sizes="(max-width: 900px) 94vw, 70vw"
                      src={activeArtwork.image}
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <div className="lightbox__fallback">
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
                <div className="lightbox__caption">
                  <p className="eyebrow">{artist.name}</p>
                  <h2>{getCopy(activeArtwork.title, locale)}</h2>
                  <p className="inline-copy">
                    {getCopy(activeArtwork.description, locale)}
                  </p>
                </div>

                <p className="lightbox__details">
                  {[
                    activeArtwork.year,
                    getCopy(activeArtwork.medium, locale),
                    activeArtwork.size,
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </p>

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
        </div>
      ) : null}
    </>
  );
}
