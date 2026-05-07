"use client";

import { useEffect, useState } from "react";

export default function HomeScrollCue({ locale = "et" }) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setIsHidden(window.scrollY > 24);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <a
      className={`home-scroll-cue ${isHidden ? "home-scroll-cue--hidden" : ""}`}
      href="#artists"
      aria-label={locale === "en" ? "Scroll to artists" : "Keri kunstnikeni"}
    />
  );
}
