import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SplashCursorEffect from "@/components/SplashCursorEffect";

export default function PageShell({
  content,
  children,
  locale = "et",
  showHeader = false,
}) {
  return (
    <div className="page-shell">
      <SplashCursorEffect />
      {showHeader ? <SiteHeader locale={locale} /> : null}
      <main className="page-main">{children}</main>
      <SiteFooter content={content} />
    </div>
  );
}
