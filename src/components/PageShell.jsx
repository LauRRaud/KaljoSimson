import FramePresetHydrator from "@/components/FramePresetHydrator";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function PageShell({
  content,
  children,
  locale = "et",
  shellClassName = "",
  showFooter = true,
  showHeader = false,
  mainClassName = "",
}) {
  return (
    <div
      className={`page-shell ${shellClassName}`.trim()}
      data-frame-preset={content?.site?.framePreset || "silver"}
    >
      <FramePresetHydrator defaultPreset={content?.site?.framePreset || "silver"} />
      {showHeader ? <SiteHeader locale={locale} /> : null}
      <main className={`page-main ${mainClassName}`.trim()}>{children}</main>
      {showFooter ? <SiteFooter content={content} /> : null}
    </div>
  );
}
