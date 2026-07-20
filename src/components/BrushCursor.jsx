/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "ks-theme";
const THEME_CHANGE_EVENT = "ks-theme-change";

function getThemeSnapshot() {
  if (typeof window === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "tume" ||
    window.localStorage.getItem(STORAGE_KEY) === "tume"
    ? "dark"
    : "light";
}

function subscribeThemeChange(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

// Klikitavad elemendid, mille kohal pintsel "ärkab" (teeb pintslitõmbe-vigurit)
const INTERACTIVE_SELECTOR =
  'a[href], button, [role="button"], input:not([type="hidden"]), select, textarea, label, summary, [tabindex]:not([tabindex="-1"])';

export default function BrushCursor() {
  const [point, setPoint] = useState(null);
  const [hot, setHot] = useState(false);
  const theme = useSyncExternalStore(
    subscribeThemeChange,
    getThemeSnapshot,
    () => "light",
  );

  useEffect(() => {
    document.body.classList.add("has-brush-cursor");

    const onPointerMove = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      setPoint({
        x: event.clientX,
        y: event.clientY,
      });

      // Kursorikiht on pointer-events:none, seega event.target on all olev
      // element. Kui see (või esivanem) on klikitav, ärkab pintsel.
      const target = event.target;
      const nextHot = Boolean(
        target && target.closest && target.closest(INTERACTIVE_SELECTOR),
      );
      setHot((prev) => (prev === nextHot ? prev : nextHot));
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.body.classList.remove("has-brush-cursor");
    };
  }, []);

  if (!point) return null;

  return createPortal(
    <span
      className={`brush-cursor brush-cursor--brush${hot ? " brush-cursor--hot" : ""}`}
      aria-hidden="true"
      style={{
        transform: `translate3d(${point.x - 29}px, ${point.y - 5}px, 0)`,
      }}
    >
      <img
        className="brush-cursor__img"
        src={theme === "dark" ? "/paint-brush2-dark.svg" : "/paint-brush2.svg"}
        alt=""
      />
    </span>,
    document.body,
  );
}
