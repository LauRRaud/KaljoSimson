"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LanguageSwitch from "@/components/LanguageSwitch";
import ThemeSwitch from "@/components/ThemeSwitch";
import { getNavLinks } from "@/lib/nav";

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

  const links = getNavLinks(locale);
  const menuLabel = locale === "en" ? "Menu" : "Menüü";
  const closeLabel = locale === "en" ? "Close menu" : "Sulge menüü";

  return (
    <>
      <button
        aria-expanded={open}
        aria-label={menuLabel}
        className="menu-toggle"
        onClick={() => setOpen(true)}
        ref={toggleRef}
        type="button"
      >
        <span aria-hidden="true" className="menu-toggle__bar" />
        <span aria-hidden="true" className="menu-toggle__bar" />
      </button>

      {open
        ? createPortal(
            <div
              aria-label={menuLabel}
              aria-modal="true"
              className="menu-overlay"
              role="dialog"
            >
              <button
                aria-label={closeLabel}
                autoFocus
                className="menu-overlay__close"
                onClick={() => {
                  close();
                  toggleRef.current?.focus();
                }}
                type="button"
              >
                <span aria-hidden="true" className="menu-overlay__close-x" />
              </button>

              <nav
                aria-label={
                  locale === "en" ? "Main navigation" : "Põhinavigeerimine"
                }
                className="menu-overlay__nav"
              >
                {links.map((link, index) => (
                  <Link
                    className="menu-overlay__link"
                    href={link.href}
                    key={link.href}
                    onClick={close}
                    style={{ "--mi": index }}
                  >
                    <span aria-hidden="true" className="menu-overlay__index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </Link>
                ))}

                <div className="menu-overlay__controls" style={{ "--mi": links.length }}>
                  <LanguageSwitch locale={locale} />
                  <ThemeSwitch locale={locale} />
                </div>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
