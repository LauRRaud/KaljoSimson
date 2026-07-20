"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
// Sein liigub transformiga (mitte native scrolliga): liuglemise kestus
// kiirusevaliku järgi, pehme koosinus-kiirendusega nagu varem.
const roomGlideDurations = {
  slow: 4400,
  normal: 3000,
  fast: 1800,
};

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

export default function GalleryClient({
  artist,
  locale = "et",
  variant = "grid",
  roomSpeed = "normal",
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState(defaultMagnifierPosition);
  // Sein on esimese paigutuse (tsentreerimise) hetkeni peidus — muidu näeks
  // kasutaja teoseid korra vasakus servas ja siis hüppamas keskele.
  const [roomReady, setRoomReady] = useState(false);
  const [roomView, setRoomView] = useState({
    page: 0,
    pageCount: 1,
    start: 0,
    end: 0,
  });
  const decodedRoomImagesRef = useRef(new Set());
  const lightboxImageWindowRef = useRef(null);
  const roomViewportRef = useRef(null);
  const roomTrackRef = useRef(null);
  const goToRoomPageRef = useRef(() => {});
  const roomDragRef = useRef({ suppressClick: false });
  const roomPageRef = useRef(0);
  const activeIndexRef = useRef(null);

  activeIndexRef.current = activeIndex;
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

  const getRoomImageSources = useCallback(
    (startIndex, visibleCount = 1, radius = 1) => {
      const start = Math.max(0, startIndex - radius * visibleCount);
      const end = Math.min(
        artist.artworks.length,
        startIndex + visibleCount + radius * visibleCount,
      );

      return artist.artworks
        .slice(start, end)
        .map((artwork) => artwork.image)
        .filter(Boolean);
    },
    [artist.artworks],
  );

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

  // Seinamootor: leheküljepõhine liikumine transformiga. Paar (või mobiilis
  // üks teos) on alati ühtmoodi keskel — ka viimasel leheküljel. Nooled,
  // kvantiseeritud ratas, lohistamine inertsiga ja klaviatuur.
  useEffect(() => {
    if (!isRoom || !hasArtworks) {
      return undefined;
    }

    const viewport = roomViewportRef.current;
    const track = roomTrackRef.current;

    if (!viewport || !track) {
      return undefined;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const glideDuration =
      roomGlideDurations[roomSpeed] ?? roomGlideDurations.normal;
    const total = artist.artworks.length;
    const drag = {
      on: false,
      moved: false,
      startX: 0,
      startCurrent: 0,
      lastX: 0,
      lastT: 0,
      vel: 0,
    };

    let pageSize = 1;
    let pageCount = total;
    // lehekülg elab efekti taaskäivituse üle (nt kiirusevaliku vahetus) —
    // muidu hüppaks sein alati algusesse tagasi
    let page = roomPageRef.current;
    let current = 0;
    let target = 0;
    let glideFrom = 0;
    let glideStartedAt = 0;
    let raf = null;
    let running = false;
    let wheelAcc = 0;
    let wheelLock = 0;
    let slotEls = [];
    let slotCenters = [];
    let slotWidth = 0;
    let slotGap = 0;
    let trackOffset = 0;
    let viewportCenter = 0;
    let lastFocus = [];

    function slots() {
      return Array.from(track.querySelectorAll(".gallery-room__slot"));
    }

    // Kõik paigutuslugemised (offsetLeft jms) tehakse ÜKS kord siin —
    // igal kaadril lugemine sundis brauserit reflow'le ja tekitas tõksumist.
    function cacheMetrics() {
      slotEls = slots();

      if (!slotEls.length) {
        slotCenters = [];
        lastFocus = [];
        return;
      }

      slotWidth = slotEls[0].offsetWidth;
      slotGap = slotEls[1]
        ? slotEls[1].offsetLeft - (slotEls[0].offsetLeft + slotWidth)
        : 0;
      slotCenters = slotEls.map(
        (slot) => slot.offsetLeft + slot.offsetWidth / 2,
      );
      trackOffset = track.offsetLeft;
      viewportCenter = viewport.clientWidth / 2;
      lastFocus = slotEls.map(() => -1);
    }

    function measurePageSize() {
      // Puuteseadmetel (mobiil ja tahvel, ka landscape) alati üks teos korraga.
      if (coarsePointer) {
        return 1;
      }

      const all = slots();

      if (all.length < 2) {
        return 1;
      }

      const styles = window.getComputedStyle(viewport);
      const usable =
        viewport.clientWidth -
        Number.parseFloat(styles.paddingLeft || "0") -
        Number.parseFloat(styles.paddingRight || "0");
      const pairSpan =
        all[1].offsetLeft + all[1].offsetWidth - all[0].offsetLeft;

      return usable + 1 >= pairSpan ? 2 : 1;
    }

    function pageBounds(p) {
      const start = p * pageSize;
      const end = Math.min(total - 1, start + pageSize - 1);
      return { start, end };
    }

    function targetFor(p) {
      const { start, end } = pageBounds(p);

      if (slotCenters[start] === undefined || slotCenters[end] === undefined) {
        return 0;
      }

      const left = slotCenters[start] - slotWidth / 2;
      const right = slotCenters[end] + slotWidth / 2;

      // track algab juba viewporti polsterduse kohalt — lahutame selle,
      // muidu nihkuks paar polsterduse võrra paremale.
      return viewportCenter - trackOffset - (left + right) / 2;
    }

    // Fookus on positsioonipõhine: iga teose heledus/suurus/teravus sõltub
    // tema kaugusest ekraani keskpunktist — muutub täpselt sama sujuvalt
    // kui sein ise liigub.
    function updateFocus() {
      if (!slotEls.length) {
        return;
      }

      const centerInTrack = viewportCenter - trackOffset - current;
      const fullRadius =
        pageSize === 2 ? (slotWidth + slotGap) / 2 + 8 : slotWidth * 0.4;
      const fadeRange = slotWidth * 1.05;

      for (let i = 0; i < slotEls.length; i += 1) {
        const distance = Math.abs(slotCenters[i] - centerInTrack);
        const focus = Math.min(
          1,
          Math.max(0, 1 - Math.max(0, distance - fullRadius) / fadeRange),
        );

        // kirjutame stiili ainult siis, kui väärtus päriselt muutus —
        // muidu maksab iga kaader style-recalc'i kõigil slottidel
        if (Math.abs(focus - lastFocus[i]) > 0.008) {
          lastFocus[i] = focus;
          slotEls[i].style.setProperty("--focus", focus.toFixed(3));
        }
      }
    }

    function paint() {
      track.style.transform = `translate3d(${current.toFixed(2)}px, 0, 0)`;
      updateFocus();
    }

    function tick() {
      if (!drag.on) {
        if (reduced) {
          current = target;
        } else {
          const progress = Math.min(
            1,
            (window.performance.now() - glideStartedAt) / glideDuration,
          );
          const eased = 0.5 - Math.cos(progress * Math.PI) / 2;

          current = glideFrom + (target - glideFrom) * eased;

          if (progress >= 1) {
            current = target;
          }
        }
      }

      paint();

      if (current === target && !drag.on) {
        running = false;
        raf = null;
        return;
      }

      raf = window.requestAnimationFrame(tick);
    }

    function wake() {
      if (!running) {
        running = true;
        raf = window.requestAnimationFrame(tick);
      }
    }

    function setPage(next) {
      page = Math.max(0, Math.min(pageCount - 1, next));
      roomPageRef.current = page;
      glideFrom = current;
      glideStartedAt = window.performance.now();
      target = targetFor(page);

      const bounds = pageBounds(page);
      setRoomView({ page, pageCount, start: bounds.start, end: bounds.end });
      predecodeRoomImages(getRoomImageSources(bounds.start, pageSize));
      wake();
    }

    function layout(instant = false) {
      pageSize = measurePageSize();
      pageCount = Math.ceil(total / pageSize);
      cacheMetrics();
      setPage(Math.min(page, pageCount - 1));

      if (instant) {
        current = target;
        glideFrom = target;
        paint();
      }
    }

    goToRoomPageRef.current = (direction) => setPage(page + direction);

    function handleWheel(event) {
      event.preventDefault();

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      const now = window.performance.now();

      if (now < wheelLock) {
        return;
      }

      wheelAcc += delta;

      if (Math.abs(wheelAcc) > 90) {
        const direction = wheelAcc > 0 ? 1 : -1;
        wheelAcc = 0;
        wheelLock = now + 420;
        setPage(page + direction);
      }
    }

    function handlePointerDown(event) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      drag.on = true;
      drag.moved = false;
      drag.startX = event.clientX;
      drag.startCurrent = current;
      drag.lastX = event.clientX;
      drag.lastT = window.performance.now();
      drag.vel = 0;
      roomDragRef.current.suppressClick = false;
      wake();
    }

    function handlePointerMove(event) {
      if (!drag.on) {
        return;
      }

      const dx = event.clientX - drag.startX;

      if (Math.abs(dx) > 8) {
        drag.moved = true;
        roomDragRef.current.suppressClick = true;
      }

      const now = window.performance.now();
      const dt = Math.max(1, now - drag.lastT);

      drag.vel = ((event.clientX - drag.lastX) / dt) * 16;
      drag.lastX = event.clientX;
      drag.lastT = now;
      current = drag.startCurrent + dx;
      target = current;
      paint();
    }

    function handlePointerEnd() {
      if (!drag.on) {
        return;
      }

      drag.on = false;

      const projected = current + drag.vel * 14;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let p = 0; p < pageCount; p += 1) {
        const distance = Math.abs(targetFor(p) - projected);

        if (distance < bestDistance) {
          bestDistance = distance;
          best = p;
        }
      }

      setPage(best);
      window.requestAnimationFrame(() => {
        roomDragRef.current.suppressClick = false;
      });
    }

    function handleKeyDown(event) {
      if (activeIndexRef.current !== null) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPage(page + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPage(page - 1);
      }
    }

    const resizeObserver = new ResizeObserver(() => layout(true));

    layout(true);
    setRoomReady(true);
    resizeObserver.observe(viewport);
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    viewport.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener("wheel", handleWheel);
      viewport.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      window.removeEventListener("keydown", handleKeyDown);

      if (raf) {
        window.cancelAnimationFrame(raf);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoom, hasArtworks, artist.artworks.length, roomSpeed]);

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
  }, [artist.artworks, hasArtworks, isRoom, getRoomImageSources]);

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
            <div
              className={`gallery-room__wall${
                roomReady ? " gallery-room__wall--ready" : ""
              }`}
              ref={roomTrackRef}
            >
              {artist.artworks.map((artwork, index) => (
                <div
                  className={`gallery-room__slot ${
                    index >= roomView.start && index <= roomView.end
                      ? "gallery-room__slot--active"
                      : "gallery-room__slot--dim"
                  }`}
                  key={artwork.slug}
                >
                  <ArtworkFrame
                    artwork={artwork}
                    imageFetchPriority={index < 2 ? "high" : undefined}
                    imageLoading={index < 4 ? "eager" : "lazy"}
                    interactive
                    locale={locale}
                    onClick={() => {
                      if (roomDragRef.current.suppressClick) {
                        return;
                      }

                      if (index < roomView.start || index > roomView.end) {
                        goToRoomPageRef.current(index < roomView.start ? -1 : 1);
                        return;
                      }

                      openLightbox(index);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <p aria-hidden="true" className="gallery-room__marker">
            <span className="gallery-room__marker-idx">
              {roomView.start + 1}
              {roomView.end > roomView.start ? `–${roomView.end + 1}` : ""}
              {" / "}
              {artist.artworks.length}
            </span>
          </p>

          {artist.artworks.length > 1 ? (
            <div className="gallery-room__controls">
              <button
                aria-label={locale === "en" ? "Move left in gallery" : "Liigu galeriis vasakule"}
                className="gallery-room__nav gallery-room__nav--prev"
                disabled={roomView.page === 0}
                onClick={() => goToRoomPageRef.current(-1)}
                type="button"
              >
                <span aria-hidden="true">&lt;</span>
              </button>
              <button
                aria-label={locale === "en" ? "Move right in gallery" : "Liigu galeriis paremale"}
                className="gallery-room__nav gallery-room__nav--next"
                disabled={roomView.page >= roomView.pageCount - 1}
                onClick={() => goToRoomPageRef.current(1)}
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
                  </div>
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
