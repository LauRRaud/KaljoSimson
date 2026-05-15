"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "beyondframes-frame-preset";
const PRESETS = ["silver", "gold"];

function isFramePreset(value) {
  return PRESETS.includes(value);
}

function getPresetLabel(preset, locale) {
  if (preset === "gold") {
    return locale === "en" ? "Gold frame" : "Kuldne raam";
  }

  return locale === "en" ? "Silver frame" : "Hõbedane raam";
}

function applyPreset(preset) {
  document.querySelector(".page-shell")?.setAttribute("data-frame-preset", preset);
  document.body?.setAttribute("data-frame-preset", preset);
}

export default function FramePresetSwitch({ defaultPreset = "silver", locale = "et" }) {
  const initialPreset = isFramePreset(defaultPreset) ? defaultPreset : "silver";
  const [activePreset, setActivePreset] = useState(initialPreset);

  useEffect(() => {
    const storedPreset = window.localStorage.getItem(STORAGE_KEY);
    const nextPreset = isFramePreset(storedPreset) ? storedPreset : initialPreset;
    applyPreset(nextPreset);

    const frame = window.requestAnimationFrame(() => {
      setActivePreset(nextPreset);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [initialPreset]);

  function choosePreset(preset) {
    setActivePreset(preset);
    window.localStorage.setItem(STORAGE_KEY, preset);
    applyPreset(preset);
  }

  return (
    <div className="frame-preset-switch" aria-label={locale === "en" ? "Frame style" : "Raamide stiil"}>
      {PRESETS.map((preset) => (
        <button
          aria-label={getPresetLabel(preset, locale)}
          aria-pressed={activePreset === preset}
          className={`frame-preset-switch__button frame-preset-switch__button--${preset}${
            activePreset === preset ? " frame-preset-switch__button--active" : ""
          }`}
          key={preset}
          onClick={() => choosePreset(preset)}
          type="button"
        >
          <span className="sr-only">{getPresetLabel(preset, locale)}</span>
        </button>
      ))}
    </div>
  );
}
