"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ks-theme";
const THEME_CHANGE_EVENT = "ks-theme-change";

function getThemeSnapshot() {
  if (typeof window === "undefined") {
    return "hele";
  }

  if (document.documentElement.dataset.theme === "tume") {
    return "tume";
  }

  return window.localStorage.getItem(STORAGE_KEY) === "tume" ? "tume" : "hele";
}

function getServerThemeSnapshot() {
  return "hele";
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

export default function ThemeSwitch({ locale = "et" }) {
  const theme = useSyncExternalStore(
    subscribeThemeChange,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const isDark = theme === "tume";
  const label =
    locale === "en"
      ? `Switch to ${isDark ? "light" : "dark"} theme`
      : `Lülita ${isDark ? "hele" : "tume"} teema`;

  return (
    <button
      aria-label={label}
      className="theme-toggle"
      onClick={() => setStoredTheme(isDark ? "hele" : "tume")}
      title={label}
      type="button"
    >
      {/* mõlemad ikoonid on DOM-is; nähtava valib CSS html[data-theme] järgi,
          nii et enne hüdratsiooni ei vilgu vale ikoon */}
      <svg
        aria-hidden="true"
        className="theme-toggle__icon theme-toggle__icon--moon"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      <svg
        aria-hidden="true"
        className="theme-toggle__icon theme-toggle__icon--sun"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.6v2.2M12 19.2v2.2M5.2 5.2 6.8 6.8M17.2 17.2l1.6 1.6M2.6 12h2.2M19.2 12h2.2M5.2 18.8l1.6-1.6M17.2 6.8l1.6-1.6" />
      </svg>
    </button>
  );
}
