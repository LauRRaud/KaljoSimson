"use client";

import { useEffect } from "react";

export default function PwaRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker?.getRegistrations?.().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });

      window.caches?.keys?.().then((keys) => {
        keys
          .filter((key) => key.startsWith("beyondframes-"))
          .forEach((key) => window.caches.delete(key));
      });

      return undefined;
    }

    if (
      !("serviceWorker" in navigator) ||
      (window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost")
    ) {
      return undefined;
    }

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (!cancelled) {
          registration.update();
        }
      } catch {
        // The site remains fully usable if service worker registration is blocked.
      }
    };

    if (document.readyState === "complete") {
      register();
      return () => {
        cancelled = true;
      };
    }

    window.addEventListener("load", register, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
