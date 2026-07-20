import { withLocale } from "@/lib/locale";

// Üks navigatsiooniallikas päisele ja mobiilimenüüle.
export function getNavLinks(locale = "et") {
  return [
    {
      path: "/",
      href: withLocale("/", locale),
      label: locale === "en" ? "Home" : "Avaleht",
    },
    {
      path: "/galerii",
      href: withLocale("/galerii", locale),
      label: locale === "en" ? "Gallery" : "Galerii",
    },
    {
      path: "/kunstnik",
      href: withLocale("/kunstnik", locale),
      label: locale === "en" ? "The artist" : "Kunstnik",
    },
    {
      path: "/#kontakt",
      href: withLocale("/", locale, "#kontakt"),
      label: locale === "en" ? "Contact" : "Kontakt",
    },
  ];
}
