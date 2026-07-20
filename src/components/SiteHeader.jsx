"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageSwitch from "@/components/LanguageSwitch";
import MobileMenu from "@/components/MobileMenu";
import ThemeSwitch from "@/components/ThemeSwitch";
import { getNavLinks } from "@/lib/nav";

export default function SiteHeader({ locale = "et" }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Kerimisel saab läbipaistev riba tausta ja alumise joone.
  // Alla kerides libiseb riba peitu, üles kerides tuleb kohe tagasi.
  useEffect(() => {
    let lastY = window.scrollY;

    function handleScroll() {
      const y = window.scrollY;

      setScrolled(y > 24);

      if (y < 90 || y < lastY - 4) {
        setHidden(false);
      } else if (y > lastY + 4) {
        setHidden(true);
      }

      lastY = y;
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = getNavLinks(locale);

  return (
    <header
      className={`topbar${scrolled ? " topbar--scrolled" : ""}${
        hidden ? " topbar--hidden" : ""
      }`}
    >
      <div className="topbar__inner">
        <nav
          aria-label={locale === "en" ? "Main navigation" : "Põhinavigeerimine"}
          className="topbar__nav"
        >
          {links.map((link) => (
            <Link
              aria-current={link.path === pathname ? "page" : undefined}
              className="topbar__link"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="topbar__controls">
          <LanguageSwitch locale={locale} />
          <ThemeSwitch locale={locale} />
        </div>

        <MobileMenu locale={locale} />
      </div>
    </header>
  );
}
