"use client";

import { useEffect, useRef, useState } from "react";
import ArtistCard from "@/components/ArtistCard";

function wrapIndex(index, length) {
  return (index + length) % length;
}

export default function HomeArtistCarousel({ artists, locale = "et" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(0);
  const animationTimeoutRef = useRef(null);
  const suppressNextClickRef = useRef(false);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    deltaX: 0,
  });

  function finishMove(direction) {
    setCurrentIndex((current) => wrapIndex(current + direction, artists.length));
    setAnimationDirection(0);
    animationTimeoutRef.current = null;
  }

  function move(direction) {
    if (artists.length <= 1 || animationDirection) {
      return;
    }

    if (artists.length < 3) {
      setCurrentIndex((current) => wrapIndex(current + direction, artists.length));
      return;
    }

    setAnimationDirection(direction > 0 ? 1 : -1);

    if (animationTimeoutRef.current) {
      window.clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = window.setTimeout(() => {
      finishMove(direction > 0 ? 1 : -1);
    }, 620);
  }

  function handlePointerDown(event) {
    if (animationDirection || event.target.closest(".artist-stage__arrow")) {
      return;
    }

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      deltaX: 0,
    };
    suppressNextClickRef.current = false;
    setIsDragging(true);
  }

  function handlePointerMove(event) {
    if (!dragStateRef.current.active) {
      return;
    }

    dragStateRef.current.deltaX = event.clientX - dragStateRef.current.startX;
  }

  function handlePointerEnd(event) {
    if (!dragStateRef.current.active) {
      return;
    }

    const { deltaX } = dragStateRef.current;

    dragStateRef.current.active = false;
    setIsDragging(false);

    if (Math.abs(deltaX) < 44) {
      dragStateRef.current.deltaX = 0;
      return;
    }

    suppressNextClickRef.current = true;
    move(deltaX < 0 ? 1 : -1);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  }

  useEffect(() => {
    if (!isKeyboardActive) {
      return undefined;
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  if (!artists.length) {
    return null;
  }

  const previousIndex = wrapIndex(currentIndex - 1, artists.length);
  const nextIndex = wrapIndex(currentIndex + 1, artists.length);
  const beforePreviousIndex = wrapIndex(currentIndex - 2, artists.length);
  const afterNextIndex = wrapIndex(currentIndex + 2, artists.length);

  let visibleCards = [];

  if (artists.length === 1) {
    visibleCards = [{ artist: artists[0], slot: "center" }];
  } else if (artists.length === 2 || !animationDirection) {
    visibleCards =
      artists.length === 2
        ? [
            { artist: artists[currentIndex], slot: "center" },
            { artist: artists[nextIndex], slot: "right" },
          ]
        : [
            { artist: artists[previousIndex], slot: "left" },
            { artist: artists[currentIndex], slot: "center" },
            { artist: artists[nextIndex], slot: "right" },
          ];
  } else if (animationDirection > 0) {
    visibleCards = [
      { artist: artists[previousIndex], slot: "left" },
      { artist: artists[currentIndex], slot: "center" },
      { artist: artists[nextIndex], slot: "right" },
      { artist: artists[afterNextIndex], slot: "incoming-right" },
    ];
  } else {
    visibleCards = [
      { artist: artists[beforePreviousIndex], slot: "incoming-left" },
      { artist: artists[previousIndex], slot: "left" },
      { artist: artists[currentIndex], slot: "center" },
      { artist: artists[nextIndex], slot: "right" },
    ];
  }

  return (
    <div className="artist-stage">
      <div
        className={`artist-stage__frame ${
          isDragging ? "artist-stage__frame--dragging" : ""
        } ${animationDirection > 0 ? "artist-stage__frame--forward" : ""} ${
          animationDirection < 0 ? "artist-stage__frame--backward" : ""
        }`}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => setIsKeyboardActive(true)}
        onPointerLeave={(event) => {
          setIsKeyboardActive(false);
          handlePointerEnd(event);
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onFocus={() => setIsKeyboardActive(true)}
        onBlur={() => setIsKeyboardActive(false)}
        tabIndex={0}
      >
        {artists.length > 1 ? (
          <button
            aria-label={locale === "en" ? "Previous artist" : "Eelmine kunstnik"}
            className="artist-stage__arrow artist-stage__arrow--left"
            onClick={(event) => {
              event.stopPropagation();
              move(-1);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            <span aria-hidden="true">&#8249;</span>
          </button>
        ) : null}

        <div className="artist-stage__track">
          {visibleCards.map(({ artist, slot }) => (
            <div
              className={`artist-stage__slot artist-stage__slot--${slot}`}
              key={`${slot}-${artist.slug}`}
            >
              <ArtistCard
                artist={artist}
                className={`artist-card--carousel ${
                  slot === "center" ? "artist-card--center" : "artist-card--side"
                }`}
                href={
                  slot === "center"
                    ? `/artists/${artist.slug}?lang=${locale}`
                    : null
                }
                locale={locale}
                onClick={
                  slot === "center"
                    ? (event) => {
                        if (suppressNextClickRef.current) {
                          event.preventDefault();
                          suppressNextClickRef.current = false;
                          dragStateRef.current.deltaX = 0;
                        }
                      }
                    : slot === "left" || slot === "incoming-left"
                      ? () => move(-1)
                      : () => move(1)
                }
                priority={slot === "center"}
                showLocation={false}
              />
            </div>
          ))}
        </div>

        {artists.length > 1 ? (
          <button
            aria-label={locale === "en" ? "Next artist" : "Järgmine kunstnik"}
            className="artist-stage__arrow artist-stage__arrow--right"
            onClick={(event) => {
              event.stopPropagation();
              move(1);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            <span aria-hidden="true">&#8250;</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
