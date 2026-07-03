"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LanguageSwitch from "@/components/LanguageSwitch";
import PwaInstallButton from "@/components/PwaInstallButton";
import ThemeToggle from "@/components/ThemeToggle";
import { withLocale } from "@/lib/locale";

export default function MobileMenu({ locale = "et" }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  // Avatud menüü lukustab tausta kerimise ja sulgub Escape'iga.
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  const links = [
    {
      href: withLocale("/artists", locale),
      label: locale === "en" ? "Artists" : "Artistid",
    },
    {
      href: withLocale("/gallery", locale),
      label: locale === "en" ? "Gallery" : "Galerii",
    },
    {
      href: withLocale("/studio", locale),
      label: locale === "en" ? "Studio" : "Stuudio",
    },
    {
      href: withLocale("/", locale, "#contact"),
      label: locale === "en" ? "Contact" : "Kontakt",
    },
  ];

  const menuLabel = locale === "en" ? "Menu" : "Menüü";
  const closeLabel = locale === "en" ? "Close menu" : "Sulge menüü";

  return (
    <>
      <button
        aria-expanded={open}
        aria-label={menuLabel}
        className="mobile-menu__toggle"
        onClick={() => setOpen(true)}
        ref={toggleRef}
        type="button"
      >
        <span aria-hidden="true" className="mobile-menu__bar" />
        <span aria-hidden="true" className="mobile-menu__bar" />
        <span aria-hidden="true" className="mobile-menu__bar" />
      </button>

      {open
        ? createPortal(
            <div
              aria-label={menuLabel}
              aria-modal="true"
              className="mobile-menu"
              role="dialog"
            >
              <button
                aria-label={closeLabel}
                autoFocus
                className="mobile-menu__close"
                onClick={() => {
                  close();
                  toggleRef.current?.focus();
                }}
                type="button"
              >
                <span aria-hidden="true" className="mobile-menu__close-x" />
              </button>

              <nav
                aria-label={
                  locale === "en" ? "Main navigation" : "Põhinavigeerimine"
                }
                className="mobile-menu__nav"
              >
                {links.map((link, index) => (
                  <Link
                    className="mobile-menu__link"
                    href={link.href}
                    key={link.href}
                    onClick={close}
                    style={{ "--mi": index }}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* keel, install ja teema on alalehtedel ainult siin */}
                <div className="mobile-menu__controls" style={{ "--mi": 4 }}>
                  <LanguageSwitch locale={locale} />
                  <PwaInstallButton locale={locale} />
                  <ThemeToggle locale={locale} />
                </div>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
