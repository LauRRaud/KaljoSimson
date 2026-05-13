"use client";

import { useSyncExternalStore } from "react";
import LineWavesJSCSS from "@/components/LineWaves-JS-CSS";

const THEME_CHANGE_EVENT = "beyondframes-theme-change";

function getThemeSnapshot() {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot() {
  return "light";
}

function subscribeThemeChange(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

const sharedPreset = {
  brightness: 0.42,
  colorCycleSpeed: 0.32,
  edgeFadeWidth: 0.2,
  enableMouseInteraction: false,
  innerLineCount: 14,
  mobileInnerLineCount: 7,
  mobileOuterLineCount: 5,
  mobileSpeed: 0.026,
  mobileWarpIntensity: 0.8,
  mouseInfluence: 0.1,
  outerLineCount: 8,
  rotation: -45,
  speed: 0.035,
  warpIntensity: 1.5,
};

const lightPalette = {
  color1: "#c9a64a",
  color2: "#ef4444",
  color3: "#7c3aed",
};

const darkPalette = {
  color1: "#d4a72c",
  color2: "#ef4444",
  color3: "#8b5cf6",
};

export default function PageLineWaves() {
  const theme = useSyncExternalStore(
    subscribeThemeChange,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const palette = theme === "dark" ? darkPalette : lightPalette;

  return (
    <div className="page-line-waves" aria-hidden="true">
      <LineWavesJSCSS {...sharedPreset} {...palette} />
    </div>
  );
}
