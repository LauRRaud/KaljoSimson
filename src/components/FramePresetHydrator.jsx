"use client";

import { useEffect } from "react";

const STORAGE_KEY = "beyondframes-frame-preset";
const PRESETS = ["silver", "gold"];

function isFramePreset(value) {
  return PRESETS.includes(value);
}

export default function FramePresetHydrator({ defaultPreset = "silver" }) {
  useEffect(() => {
    const storedPreset = window.localStorage.getItem(STORAGE_KEY);
    const nextPreset = isFramePreset(storedPreset) ? storedPreset : defaultPreset;
    document.querySelector(".page-shell")?.setAttribute("data-frame-preset", nextPreset);
  }, [defaultPreset]);

  return null;
}
