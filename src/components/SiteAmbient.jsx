"use client";

import { usePathname } from "next/navigation";
import BrushCursor from "@/components/BrushCursor";
import SplashCursor from "@/components/SplashCursor";

// Pintslikursor + maali värvidega vedelikujälg. Admin jääb tavakursoriga.
// Galeriiruumis jäetakse värvijälg ära, et see teoseid ei segaks.
export default function SiteAmbient() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isGallery = pathname?.startsWith("/galerii");

  if (isAdmin) {
    return null;
  }

  return (
    <>
      {isGallery ? null : <SplashCursor />}
      <BrushCursor />
    </>
  );
}
