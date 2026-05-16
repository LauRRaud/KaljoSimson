import GalleryRoomExperience from "@/components/GalleryRoomExperience";
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
