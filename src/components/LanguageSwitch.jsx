"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function LanguageSwitch({ locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextLocale = locale === "en" ? "et" : "en";
  const currentCode = locale === "en" ? "EN" : "ET";
  const nextLabel = nextLocale === "en" ? "English" : "Eesti";
  const switchText =
    locale === "en" ? `Switch language: ${nextLabel}` : `Vaheta keel: ${nextLabel}`;

  function getHref(nextLocale) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLocale);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div
      className="language-switch"
      aria-label={locale === "en" ? "Language selection" : "Keele valik"}
    >
      <Link
        className="language-switch__item"
        href={getHref(nextLocale)}
        aria-label={switchText}
      >
        <span className="language-switch__code" aria-hidden="true">
          {currentCode}
        </span>
        <span className="language-switch__chevron" aria-hidden="true" />
        <span className="language-switch__label">
          {currentCode}. {switchText}
        </span>
      </Link>
    </div>
  );
}
