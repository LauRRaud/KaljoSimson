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

  // Kerimisel saab läbipaistev riba tausta ja alumise joone.
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = getNavLinks(locale);

  return (
    <header className={`topbar${scrolled ? " topbar--scrolled" : ""}`}>
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
