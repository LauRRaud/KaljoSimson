"use client";

import { usePathname } from "next/navigation";
import BrushCursor from "@/components/BrushCursor";
import SplashCursor from "@/components/SplashCursor";

// Pintslikursor + maali värvidega vedelikujälg. Admin jääb tavakursoriga.
export default function SiteAmbient() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <SplashCursor />
      <BrushCursor />
    </>
  );
}
