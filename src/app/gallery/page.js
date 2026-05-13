import Link from "next/link";
import GalleryClient from "@/components/GalleryClient";
import PageShell from "@/components/PageShell";
import { getCopy } from "@/lib/content-helpers";
import { getSiteContent } from "@/lib/content-store";
import { getLocaleFromSearchParams, withLocale } from "@/lib/locale";
import { artworkToGalleryItem, getPublishedArtworks } from "@/lib/artworks";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const content = await getSiteContent();

  return {
    title: locale === "en" ? "Gallery" : "Galerii",
    description: getCopy(content.site.heroText, locale),
  };
}

export default async function GalleryPage({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const [content, artworks] = await Promise.all([
    getSiteContent(),
    getPublishedArtworks(),
  ]);
  const galleryArtist = {
    name: content.site.title,
    slug: "gallery",
    artworks: artworks.map(artworkToGalleryItem),
  };

  return (
    <PageShell content={content} locale={locale}>
      <section className="section gallery-room-section">
        <div className="section-heading section-heading--centered">
          <Link className="inline-link" href={withLocale("/", locale)}>
            {locale === "en" ? "Back to homepage" : "Tagasi avalehele"}
          </Link>
          <h1>{locale === "en" ? "Gallery" : "Galerii"}</h1>
          <p className="section-copy">
            {locale === "en"
              ? "Selected works currently visible on BeyondFrames."
              : "BeyondFramesis hetkel avaldatud valik teoseid."}
          </p>
          <a className="button button--ghost" href={`mailto:${content.contact.email}`}>
            {locale === "en" ? "Ask about a work" : "Küsi töö kohta"}
          </a>
        </div>

        <GalleryClient artist={galleryArtist} locale={locale} variant="room" />
      </section>
    </PageShell>
  );
}
