import Link from "next/link";
import PageShell from "@/components/PageShell";
import ArtistPortrait from "@/components/ArtistPortrait";
import GalleryClient from "@/components/GalleryClient";
import { getCopy } from "@/lib/content-helpers";
import { getSiteContent } from "@/lib/content-store";
import { getLocaleFromSearchParams, withLocale } from "@/lib/locale";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const locale = getLocaleFromSearchParams(query);
  const content = await getSiteContent();
  const artist = content.artists.find((entry) => entry.slug === slug);

  if (!artist) {
    return {
      title: locale === "en" ? "Artist not found" : "Kunstnikku ei leitud",
    };
  }

  return {
    title: artist.name,
    description: getCopy(artist.shortBio, locale),
  };
}

export default async function ArtistPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const locale = getLocaleFromSearchParams(query);
  const content = await getSiteContent();
  const artist = content.artists.find((entry) => entry.slug === slug);

  if (!artist) {
    notFound();
  }

  const biographyParagraphs = getCopy(artist.biography, locale)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <PageShell
      content={content}
      locale={locale}
      shellClassName="page-shell--gallery-surface"
    >
      <section className="section profile-hero">
        <div className="profile-nav">
          <Link className="inline-link profile-back-link" href={withLocale("/", locale)}>
            {locale === "en" ? "Back" : "Tagasi"}
          </Link>
        </div>

        <ArtistPortrait artist={artist} priority />

        <div className="profile-copy">
          <h1>{artist.name}</h1>
          <p className="profile-copy__lead">{getCopy(artist.role, locale)}</p>
          <p className="section-copy">{getCopy(artist.shortBio, locale)}</p>

          <div className="profile-tags-actions">
            <div className="pill-row">
              {artist.focus.map((focus) => (
                <span className="pill" key={getCopy(focus, "et") || getCopy(focus, "en")}>
                  {getCopy(focus, locale)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-biography">
          <p className="eyebrow">{locale === "en" ? "Biography" : "Biograafia"}</p>
          {biographyParagraphs.map((paragraph) => (
            <p className="section-copy" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="section" id="works">
        <div className="section-heading section-heading--centered">
          <h2>{locale === "en" ? "Gallery" : "Galerii"}</h2>
        </div>

        <GalleryClient
          artist={{
            ...artist,
            artworks: artist.artworks,
          }}
          locale={locale}
        />
      </section>
    </PageShell>
  );
}
