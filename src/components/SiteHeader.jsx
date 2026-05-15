import Link from "next/link";
import LanguageSwitch from "@/components/LanguageSwitch";
import PwaInstallButton from "@/components/PwaInstallButton";
import ThemeToggle from "@/components/ThemeToggle";
import { withLocale } from "@/lib/locale";

export default function SiteHeader({ locale = "et" }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <nav
          className="site-nav"
          aria-label={locale === "en" ? "Main navigation" : "P\u00f5hinavigeerimine"}
        >
          <div className="site-nav__links">
            <Link href={withLocale("/gallery", locale)}>
              {locale === "en" ? "Gallery" : "Galerii"}
            </Link>
            <Link href={withLocale("/studio", locale)}>
              {locale === "en" ? "Studio" : "Stuudio"}
            </Link>
            <Link href={withLocale("/", locale, "#contact")}>
              {locale === "en" ? "Contact" : "Kontakt"}
            </Link>
          </div>

          <div className="site-nav__controls">
            <LanguageSwitch locale={locale} />
            <PwaInstallButton locale={locale} />
            <ThemeToggle locale={locale} />
          </div>
        </nav>
      </div>
    </header>
  );
}
