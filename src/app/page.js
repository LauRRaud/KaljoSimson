import FlightScene from "@/components/home/FlightScene";
import PageShell from "@/components/PageShell";
import { getCopy } from "@/lib/content-helpers";
import { getSiteContent } from "@/lib/content-store";
import { getWorksCountLabel, homeCopy } from "@/lib/home-copy";
import { getLocaleFromSearchParams, withLocale } from "@/lib/locale";
import { getArtworkPalette } from "@/lib/paint-palettes";

function getBrandWords(title) {
  if (title === "BeyondFrames") {
    return ["Beyond", "Frames"];
  }

  const words = title.split(/\s+/);
  return words.length > 1 ? [words[0], words.slice(1).join(" ")] : [title];
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const content = await getSiteContent();

  return {
    title: content.site.title,
    description: getCopy(content.site.heroText, locale),
  };
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const content = await getSiteContent();
  const t = (key) => getCopy(homeCopy[key], locale);

  const orderedArtists = [...content.artists].sort(
    (a, b) => b.artworks.length - a.artworks.length,
  );

  const rooms = orderedArtists.map((artist) => {
    const artworks = [...artist.artworks]
      .sort((a, b) => a.galleryOrder - b.galleryOrder)
      .filter((artwork) => artwork.image);

    return {
      slug: artist.slug,
      name: artist.name,
      role: getCopy(artist.role, locale),
      countLabel: artist.artworks.length
        ? getWorksCountLabel(artist.artworks.length, locale)
        : "",
      artwork: artworks[0] || null,
      palette: getArtworkPalette(artist.slug, artworks[0]?.slug || ""),
      artist: {
        name: artist.name,
        portraitImage: artist.portraitImage,
        portraitPosition: artist.portraitPosition,
        portraitPresetId: artist.portraitPresetId,
      },
      href: withLocale(`/artists/${artist.slug}`, locale),
    };
  });

  return (
    <PageShell
      content={content}
      locale={locale}
      shellClassName="page-shell--gallery-surface page-shell--bfl"
      mainClassName="page-main--bfl"
      showFooter={false}
      showHeader
    >
      <FlightScene
        finale={{
          contactTitle: getCopy(content.site.contactTitle, locale),
          email: content.contact.email,
          phone: content.contact.phone,
          instagram: content.contact.instagram,
          instagramUrl: content.contact.instagramUrl,
        }}
        intro={{
          title: content.site.title,
          brandWords: getBrandWords(content.site.title),
          tagline: getCopy(content.site.tagline, locale),
        }}
        labels={{
          scrollCue: t("scrollCue"),
          scrollCueAria: t("scrollCueAria"),
          roomAria: t("roomAria"),
          profileButton: t("profileButton"),
        }}
        locale={locale}
        rooms={rooms}
      />
    </PageShell>
  );
}
