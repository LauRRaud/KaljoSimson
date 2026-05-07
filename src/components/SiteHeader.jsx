import Link from "next/link";
import LanguageSwitch from "@/components/LanguageSwitch";
import ThemeToggle from "@/components/ThemeToggle";
import { withLocale } from "@/lib/locale";

export default function SiteHeader({ locale = "et" }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <nav
          className="site-nav"
          aria-label={locale === "en" ? "Main navigation" : "Põhinavigeerimine"}
        >
          <Link href={withLocale("/", locale, "#artists")}>
            {locale === "en" ? "Artists" : "Kunstnikud"}
          </Link>
          <Link href={withLocale("/", locale, "#contact")}>
            {locale === "en" ? "Contact" : "Kontakt"}
          </Link>
          <div className="site-nav__controls">
            <LanguageSwitch locale={locale} />
            <ThemeToggle locale={locale} />
          </div>
        </nav>
      </div>
    </header>
  );
}
