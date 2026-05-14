"use client";

import { usePathname } from "next/navigation";
import PageLineWaves from "@/components/PageLineWaves";
import SplashCursor from "@/components/SplashCursor";

export default function SiteAmbient() {
  const pathname = usePathname();
  const isGalleryRoom = pathname === "/gallery";
  const isAdmin = pathname?.startsWith("/admin");

  const className = `site-ambient ${isGalleryRoom ? "site-ambient--gallery-room" : ""}`.trim();

  return (
    <div className={className} aria-hidden="true">
      <PageLineWaves />
      {isAdmin || isGalleryRoom ? null : <SplashCursor />}
    </div>
  );
}
