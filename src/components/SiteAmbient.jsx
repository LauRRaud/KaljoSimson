"use client";

import { usePathname } from "next/navigation";
import BrushCursor from "@/components/BrushCursor";
import SplashCursor from "@/components/SplashCursor";

export default function SiteAmbient() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isStudio = pathname === "/studio";
  // Avalehel ja artistide lehel asendab vikerkaarevärvidega kursorivedeliku
  // paletipõhine LivingPaint — topelt-simulatsiooni ei jooksutata.
  const hasLivingPaint = pathname === "/" || pathname === "/artists";

  return (
    <>
      {isAdmin || isStudio || hasLivingPaint ? null : <SplashCursor />}
      {isAdmin ? null : <BrushCursor />}
    </>
  );
}
