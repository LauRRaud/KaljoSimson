"use client";

import { useSyncExternalStore } from "react";
import LightRaysJSCSS from "@/components/LightRays-JS-CSS";

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

function getServerThemeSnapshot() {
  return "light";
}

function subscribeThemeChange(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

const darkPreset = {
  rays: {
    animated: true,
    fadeDistance: 1.08,
    followMouse: true,
    lightSpread: 0.28,
    mouseInfluence: 0.16,
    noiseAmount: 0,
    rayLength: 1.42,
    raysColor: "#f4ecdd",
    raysOrigin: "top-center",
    raysSpeed: 0,
    saturation: 0.72,
  },
};

export default function HomeHeroEffects() {
  const theme = useSyncExternalStore(
    subscribeThemeChange,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const isDark = theme === "dark";

  if (!isDark) {
    return null;
  }

  return (
    <div className="home-title__beam" aria-hidden="true">
      <LightRaysJSCSS {...darkPreset.rays} />
    </div>
  );
}
