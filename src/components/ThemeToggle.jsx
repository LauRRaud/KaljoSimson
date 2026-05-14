"use client";

import { useSyncExternalStore } from "react";

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

function setStoredTheme(theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export default function ThemeToggle({ locale = "et" }) {
  const theme = useSyncExternalStore(
    subscribeThemeChange,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function toggleTheme() {
    setStoredTheme(theme === "dark" ? "light" : "dark");
  }

  const isDark = theme === "dark";
  const toDarkText = locale === "en" ? "Dark" : "Tume";
  const toLightText = locale === "en" ? "Light" : "Hele";
  const label =
    locale === "en"
      ? `Switch to ${isDark ? "light" : "dark"} mode`
      : `L\u00fclita ${isDark ? "hele" : "tume"} re\u017eiim`;

  return (
    <button
      aria-label={label}
      className="theme-toggle"
      onClick={toggleTheme}
      title={label}
      type="button"
    >
      <span className="theme-toggle__label theme-toggle__label--to-dark">
        {toDarkText}
      </span>
      <span className="theme-toggle__label theme-toggle__label--to-light">
        {toLightText}
      </span>
    </button>
  );
}
