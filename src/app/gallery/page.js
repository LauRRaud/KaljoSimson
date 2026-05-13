import Link from "next/link";
import GalleryClient from "@/components/GalleryClient";
import PageShell from "@/components/PageShell";
import { getCopy } from "@/lib/content-helpers";
import { getSiteContent } from "@/lib/content-store";
import { getLocaleFromSearchParams, withLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

function getSelectedGalleryArtworks(content) {
  return content.artists
    .flatMap((artist) =>
      artist.artworks
        .filter((artwork) => artwork.showInGallery && artwork.image)
        .map((artwork, index) => ({
          ...artwork,
          artistName: artist.name,
          slug: `${artist.slug}-${artwork.slug || index}`,
          galleryOrder: artwork.galleryOrder ?? index,
        })),
    )
    .sort((first, second) => {
      const firstOrder = first.galleryOrder ?? 0;
      const secondOrder = second.galleryOrder ?? 0;

      return firstOrder - secondOrder;
    });
}

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
  const content = await getSiteContent();
  const galleryArtist = {
    name: content.site.title,
    slug: "gallery",
    artworks: getSelectedGalleryArtworks(content),
  };

  return (
    <PageShell
      content={content}
      locale={locale}
      mainClassName="page-main--gallery"
      showFooter={false}
    >
      <section className="gallery-room-page">
        <div className="gallery-room-page__heading">
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
