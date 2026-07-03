import PageShell from "@/components/PageShell";
import StudioCanvas from "@/components/StudioCanvas";
import { getSiteContent } from "@/lib/content-store";
import { getLocaleFromSearchParams } from "@/lib/locale";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);

  return {
    title: locale === "en" ? "Studio" : "Stuudio",
    description:
      locale === "en"
        ? "A quiet sketchbook for drawing on BeyondFrames."
        : "Rahulik sketchbook BeyondFrames platvormil joonistamiseks.",
  };
}

export default async function StudioPage({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const content = await getSiteContent();

  return (
    <PageShell
      content={content}
      locale={locale}
      shellClassName="page-shell--gallery-surface page-shell--studio"
      mainClassName="page-main--studio"
    >
      <StudioCanvas locale={locale} />
    </PageShell>
  );
}
