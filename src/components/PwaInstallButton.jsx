"use client";

import { useEffect, useState } from "react";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIosSafariInstallFallback() {
  const navigator = window.navigator;
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isIosDevice = /iPad|iPhone|iPod/.test(userAgent);
  const isTouchMac = platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const isSafari = /^((?!CriOS|FxiOS|EdgiOS|OPiOS).)*Safari/i.test(userAgent);

  return (isIosDevice || isTouchMac) && isSafari;
}

export default function PwaInstallButton({ locale = "et" }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installHintVisible, setInstallHintVisible] = useState(false);
  const [iosInstallFallback, setIosInstallFallback] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIosInstallFallback(isIosSafariInstallFallback());
      setInstalled(isStandalone());
    });

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallHintVisible(false);
      setInstallPrompt(event);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!installHintVisible) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setInstallHintVisible(false);
    }, 4200);

    return () => window.clearTimeout(timeout);
  }, [installHintVisible]);

  if (installed) {
    return null;
  }

  async function installApp() {
    const prompt = installPrompt;

    if (!prompt) {
      if (iosInstallFallback) {
        setInstallHintVisible(true);
      }

      return;
    }

    setInstallHintVisible(false);
    setInstallPrompt(null);
    await prompt.prompt();
    const choice = await prompt.userChoice;

    if (choice.outcome !== "accepted") {
      setInstallPrompt(prompt);
    }
  }

  const label = locale === "en" ? "Install app" : "Paigalda rakendus";
  const hint = locale === "en" ? "Share - Add to Home Screen" : "Jaga - Lisa avalehele";

  return (
    <span className="pwa-install">
      <button
        aria-label={label}
        className="pwa-install-button"
        onClick={() => {
          installApp();
        }}
        title={label}
        type="button"
      >
        <span className="sr-only">{label}</span>
        <svg
          aria-hidden="true"
          className="pwa-install-button__icon pwa-install-button__icon--desktop"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path d="M4 5.8h16v10.4H4z" />
          <path d="M2.6 19.1h18.8" />
          <path d="M12 7.9v6.6" />
          <path d="m9.3 11.9 2.7 2.7 2.7-2.7" />
        </svg>
        <svg
          aria-hidden="true"
          className="pwa-install-button__icon pwa-install-button__icon--mobile"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path d="M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 19V5A1.5 1.5 0 0 1 8 3.5Z" />
          <path d="M10.5 17.5h3" />
          <path d="M12 7v6" />
          <path d="m9.8 10.8 2.2 2.2 2.2-2.2" />
        </svg>
      </button>
      {installHintVisible ? (
        <span aria-live="polite" className="pwa-install__hint" role="status">
          {hint}
        </span>
      ) : null}
    </span>
  );
}
