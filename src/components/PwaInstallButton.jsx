"use client";

import { useEffect, useState } from "react";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function PwaInstallButton({ locale = "et" }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installHintVisible, setInstallHintVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setInstalled(isStandalone());
    });

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
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

  if (installed) {
    return null;
  }

  async function installApp() {
    const prompt = installPrompt;

    if (!prompt) {
      return;
    }

    setInstallPrompt(null);
    await prompt.prompt();
    const choice = await prompt.userChoice;

    if (choice.outcome !== "accepted") {
      setInstallPrompt(prompt);
    }
  }

  const label = locale === "en" ? "Install app" : "Paigalda rakendus";
  const hint =
    locale === "en"
      ? "Use the browser menu to install the app."
      : "Paigalda brauseri menüüst.";

  return (
    <span className="pwa-install">
      <button
        aria-describedby={installHintVisible ? "pwa-install-hint" : undefined}
        aria-label={label}
        className="pwa-install-button"
        onClick={() => {
          if (installPrompt) {
            installApp();
            return;
          }

          setInstallHintVisible((current) => !current);
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
        <span className="pwa-install__hint" id="pwa-install-hint" role="status">
          {hint}
        </span>
      ) : null}
    </span>
  );
}
