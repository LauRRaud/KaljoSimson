"use client";

import { useEffect, useState } from "react";

export default function HomeScrollCue({ locale = "et" }) {
  const [visibility, setVisibility] = useState(1);

  useEffect(() => {
    let animationFrame = null;

    function updateVisibility() {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      animationFrame = window.requestAnimationFrame(() => {
        const nextVisibility = Math.max(0, Math.min(1, 1 - window.scrollY / 96));
        setVisibility(nextVisibility);
        animationFrame = null;
      });
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  return (
    <a
      className={`home-scroll-cue ${visibility <= 0 ? "home-scroll-cue--hidden" : ""}`}
      href="#artists"
      aria-label={locale === "en" ? "Scroll to artists" : "Keri kunstnikeni"}
      style={{
        "--home-scroll-cue-opacity": visibility,
        "--home-scroll-cue-scroll-offset": `${(1 - visibility) * 18}px`,
      }}
    />
  );
}
