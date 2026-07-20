import Link from "next/link";
import ArtistPortrait from "@/components/ArtistPortrait";
import GalleryClient from "@/components/GalleryClient";
import PageShell from "@/components/PageShell";
import ScrollReveal from "@/components/ScrollReveal";
import { getCopy } from "@/lib/content-helpers";
import { getSiteContent } from "@/lib/content-store";
import { getLocaleFromSearchParams, withLocale } from "@/lib/locale";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const content = await getSiteContent();

  return {
    title: locale === "en" ? "The artist" : "Kunstnik",
    description: getCopy(content.artist.shortBio, locale),
  };
}

export default async function ArtistPage({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const content = await getSiteContent();
  const artist = content.artist;

  const biographyParagraphs = getCopy(artist.biography, locale)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <PageShell
      content={content}
      locale={locale}
      mainClassName="page-main--profile"
    >
      <ScrollReveal />

      <section className="profile-hero" data-reveal>
        <ArtistPortrait artist={artist} priority />

        <div className="profile-copy">
          <p className="eyebrow">{getCopy(artist.role, locale)}</p>
          <h1>{artist.name}</h1>
          <p className="section-copy">{getCopy(artist.shortBio, locale)}</p>

          <div className="pill-row">
            {artist.focus.map((focus) => (
              <span className="pill" key={getCopy(focus, "et") || getCopy(focus, "en")}>
                {getCopy(focus, locale)}
              </span>
            ))}
          </div>
        </div>

        <div className="profile-biography" lang={locale}>
          <p className="eyebrow">{locale === "en" ? "Biography" : "Biograafia"}</p>
          {biographyParagraphs.map((paragraph) => (
            <p className="section-copy" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="profile-works" id="teosed" data-reveal>
        <div className="profile-works__heading">
          <h2>{locale === "en" ? "Works" : "Teosed"}</h2>
          <p className="section-copy">{getCopy(artist.galleryIntro, locale)}</p>
          <Link className="inline-link" href={withLocale("/galerii", locale)}>
            {locale === "en" ? "Open the gallery room" : "Ava galeriiruum"}
          </Link>
        </div>

        <GalleryClient artist={artist} locale={locale} />
      </section>
    </PageShell>
  );
}
