import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import PageLineWaves from "@/components/PageLineWaves";
import SplashCursor from "@/components/SplashCursor";

export default function PageShell({
  content,
  children,
  locale = "et",
  showFooter = true,
  showHeader = false,
  mainClassName = "",
}) {
  return (
    <div className="page-shell">
      <PageLineWaves />
      <SplashCursor />
      {showHeader ? <SiteHeader locale={locale} /> : null}
      <main className={`page-main ${mainClassName}`.trim()}>{children}</main>
      {showFooter ? <SiteFooter content={content} /> : null}
    </div>
  );
}
