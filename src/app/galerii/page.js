import GalleryRoomExperience from "@/components/GalleryRoomExperience";
import PageShell from "@/components/PageShell";
import { getCopy } from "@/lib/content-helpers";
import { getSiteContent } from "@/lib/content-store";
import { getLocaleFromSearchParams, withLocale } from "@/lib/locale";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const content = await getSiteContent();

  return {
    title: locale === "en" ? "Gallery" : "Galerii",
    description: getCopy(content.artist.galleryIntro, locale),
  };
}

export default async function GalleryPage({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const content = await getSiteContent();
  const galleryArtist = {
    name: content.artist.name,
    slug: "galerii",
    artworks: [...content.artist.artworks]
      .filter((artwork) => artwork.showInGallery && artwork.image)
      .sort((a, b) => (a.galleryOrder ?? 0) - (b.galleryOrder ?? 0)),
  };

  return (
    <PageShell
      content={content}
      locale={locale}
      mainClassName="page-main--gallery"
      showFooter={false}
      showHeader={false}
    >
      <section className="gallery-room-page">
        <GalleryRoomExperience
          artist={galleryArtist}
          backHref={withLocale("/", locale)}
          backLabel={locale === "en" ? "Back" : "Tagasi"}
          defaultFramePreset={content.site.framePreset}
          defaultRoomSpeed={content.site.galleryRoomSpeed}
          locale={locale}
        />
      </section>
    </PageShell>
  );
}
