"use client";

import { usePathname } from "next/navigation";
import PageLineWaves from "@/components/PageLineWaves";
import SplashCursor from "@/components/SplashCursor";

export default function SiteAmbient() {
  const pathname = usePathname();
  const isGalleryRoom = pathname === "/gallery";
  const isAdmin = pathname?.startsWith("/admin");

  if (isGalleryRoom) {
    return null;
  }

  return (
    <div className="site-ambient" aria-hidden="true">
      <PageLineWaves />
      {isAdmin ? null : <SplashCursor />}
    </div>
  );
}
