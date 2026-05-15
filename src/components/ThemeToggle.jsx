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
      <svg
        aria-hidden="true"
        className="theme-toggle__icon theme-toggle__icon--moon"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
          fill="none"
          stroke="currentColor"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="theme-toggle__icon theme-toggle__icon--sun"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4.4" />
        <path d="M12 2.5v2.7M12 18.8v2.7M5.3 5.3l1.9 1.9M16.8 16.8l1.9 1.9M2.5 12h2.7M18.8 12h2.7M5.3 18.7l1.9-1.9M16.8 7.2l1.9-1.9" />
      </svg>
    </button>
  );
}
