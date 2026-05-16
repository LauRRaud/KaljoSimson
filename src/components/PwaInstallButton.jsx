"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function PwaInstallButton({ locale = "et" }) {
  const buttonRef = useRef(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installHintVisible, setInstallHintVisible] = useState(false);
  const [installHintPosition, setInstallHintPosition] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const updateInstallHintPosition = useCallback(() => {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();

    setInstallHintPosition({
      left: rect.left + rect.width / 2,
      top: rect.bottom + 12,
    });
  }, []);

  useEffect(() => {
    setMounted(true);

    const frame = window.requestAnimationFrame(() => {
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

    updateInstallHintPosition();

    function handleViewportChange() {
      updateInstallHintPosition();
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    const timeout = window.setTimeout(() => {
      setInstallHintVisible(false);
    }, 4200);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [installHintVisible, updateInstallHintPosition]);

  if (installed) {
    return null;
  }

  async function installApp() {
    const prompt = installPrompt;

    if (!prompt) {
      updateInstallHintPosition();
      setInstallHintVisible(true);
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
  const installHint =
    mounted && installHintVisible && installHintPosition
      ? createPortal(
          <span
            aria-live="polite"
            className="pwa-install__hint"
            role="status"
            style={{
              "--pwa-install-hint-left": `${installHintPosition.left}px`,
              "--pwa-install-hint-top": `${installHintPosition.top}px`,
            }}
          >
            {hint}
          </span>,
          document.body,
        )
      : null;

  return (
    <span className="pwa-install">
      <button
        aria-label={label}
        className="pwa-install-button"
        onClick={() => {
          installApp();
        }}
        ref={buttonRef}
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
      {installHint}
    </span>
  );
}
