import FramePresetHydrator from "@/components/FramePresetHydrator";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function PageShell({
  content,
  children,
  locale = "et",
  shellClassName = "",
  showFooter = true,
  showHeader = true,
  mainClassName = "",
}) {
  return (
    <div
      className={`site-shell ${shellClassName}`.trim()}
      data-frame-preset={content?.site?.framePreset || "bronze"}
    >
      <FramePresetHydrator defaultPreset={content?.site?.framePreset || "bronze"} />
      {showHeader ? <SiteHeader locale={locale} /> : null}
      <main className={`page-main ${mainClassName}`.trim()}>{children}</main>
      {showFooter ? <SiteFooter content={content} locale={locale} /> : null}
    </div>
  );
}
