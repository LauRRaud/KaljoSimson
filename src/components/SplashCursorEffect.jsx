"use client";

import { useEffect, useState } from "react";
import SplashCursor from "@/components/SplashCursor";

export default function SplashCursorEffect() {
  const [canRunEffect, setCanRunEffect] = useState(false);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");

    function updateAvailability() {
      setCanRunEffect(!reducedMotionQuery.matches && finePointerQuery.matches);
    }

    updateAvailability();
    reducedMotionQuery.addEventListener("change", updateAvailability);
    finePointerQuery.addEventListener("change", updateAvailability);

    return () => {
      reducedMotionQuery.removeEventListener("change", updateAvailability);
      finePointerQuery.removeEventListener("change", updateAvailability);
    };
  }, []);

  if (!canRunEffect) {
    return null;
  }

  return (
    <SplashCursor
      RAINBOW_MODE
      SPLAT_FORCE={1400}
      SPLAT_RADIUS={0.035}
      TRANSPARENT
    />
  );
}
