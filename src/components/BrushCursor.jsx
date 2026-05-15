"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "beyondframes-theme";
const THEME_CHANGE_EVENT = "beyondframes-theme-change";

function getThemeSnapshot() {
  if (typeof window === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ||
    window.localStorage.getItem(STORAGE_KEY) === "dark"
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

export default function BrushCursor() {
  const [point, setPoint] = useState(null);
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
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.body.classList.remove("has-brush-cursor");
    };
  }, []);

  if (!point) return null;

  return createPortal(
    <img
      className="brush-cursor brush-cursor--paint-brush2"
      src={theme === "dark" ? "/paint-brush2-dark.svg" : "/paint-brush2.svg"}
      alt=""
      aria-hidden="true"
      style={{
        transform: `translate3d(${point.x - 29}px, ${point.y - 5}px, 0) rotate(-4deg)`,
      }}
    />,
    document.body,
  );
}
