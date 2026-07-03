import Link from "next/link";
import ArtistPortrait from "@/components/ArtistPortrait";
import LivingPaint from "@/components/home/LivingPaint";
import PageShell from "@/components/PageShell";
import { getCopy } from "@/lib/content-helpers";
import { getSiteContent } from "@/lib/content-store";
import { getWorksCountLabel, homeCopy } from "@/lib/home-copy";
import { getLocaleFromSearchParams, withLocale } from "@/lib/locale";
import { DEFAULT_PALETTE } from "@/lib/paint-palettes";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);

  return {
    title: locale === "en" ? "Artists" : "Artistid",
  };
}

export default async function ArtistsPage({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const content = await getSiteContent();
  const viewProfile = getCopy(homeCopy.viewProfile, locale);

  return (
    <PageShell
      content={content}
      locale={locale}
      mainClassName="page-main--artists"
      shellClassName="page-shell--void"
      showHeader
    >
      <div aria-hidden="true" className="artists-index__ambient">
        <LivingPaint intensity={0.55} palette={DEFAULT_PALETTE} />
      </div>

      <div className="profile-nav">
        <Link className="inline-link profile-back-link" href={withLocale("/", locale)}>
          {locale === "en" ? "Back" : "Tagasi"}
        </Link>
      </div>

      <section className="artists-index">
        <h1 className="sr-only">{locale === "en" ? "Artists" : "Artistid"}</h1>

        <div className="artists-index__list">
          {content.artists.map((artist, index) => (
            <Link
              className={`artists-index__row ${
                index % 2 === 1 ? "artists-index__row--flip" : ""
              }`}
              href={withLocale(`/artists/${artist.slug}`, locale)}
              key={artist.slug}
              style={{ "--ri": index }}
            >
              <span className="artists-index__portrait">
                <ArtistPortrait artist={artist} priority={index < 2} />
              </span>

              <span className="artists-index__body">
                <span className="artists-index__role">
                  {getCopy(artist.role, locale)}
                </span>
                <strong className="artists-index__name">{artist.name}</strong>
                <span className="artists-index__bio">
                  {getCopy(artist.shortBio, locale)}
                </span>
                <span className="artists-index__meta">
                  {artist.focus
                    .map((focus) => getCopy(focus, locale))
                    .filter(Boolean)
                    .join(" · ")}
                  {artist.artworks.length ? (
                    <em className="artists-index__count">
                      {getWorksCountLabel(artist.artworks.length, locale)}
                    </em>
                  ) : null}
                </span>
                <span aria-hidden="true" className="artists-index__cta">
                  {viewProfile}
                  <span className="artists-index__cta-arrow"> →</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
