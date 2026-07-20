"use client";

import { useEffect } from "react";

const STORAGE_KEY = "ks-frame-preset";
const PRESETS = ["silver", "gold", "bronze"];

function isFramePreset(value) {
  return PRESETS.includes(value);
}

function applyPreset(preset) {
  document.documentElement?.setAttribute("data-frame-preset", preset);
  document.querySelector(".site-shell")?.setAttribute("data-frame-preset", preset);
  document.body?.setAttribute("data-frame-preset", preset);
}

export default function FramePresetHydrator({ defaultPreset = "bronze" }) {
  useEffect(() => {
    const storedPreset = window.localStorage.getItem(STORAGE_KEY);
    const nextPreset = isFramePreset(storedPreset) ? storedPreset : defaultPreset;
    applyPreset(nextPreset);
  }, [defaultPreset]);

  return null;
}
