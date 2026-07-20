/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
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
    description: getCopy(content.site.heroLead, locale),
  };
}

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const content = await getSiteContent();
  const artist = content.artist;
  const t = (et, en) => (locale === "en" ? en : et);

  const works = [...artist.artworks]
    .sort((a, b) => a.galleryOrder - b.galleryOrder)
    .filter((artwork) => artwork.image);

  const phoneHref = content.contact.phone.replace(/\s+/g, "");
  const [firstName, ...restName] = artist.name.split(" ");

  return (
    <PageShell content={content} locale={locale} mainClassName="page-main--home">
      <ScrollReveal />

      <section className="hero">
        <div className="hero__copy">
          <h1 className="hero__name">
            <span className="hero__name-word">{firstName}</span>
            <span className="hero__name-word hero__name-word--last">
              {restName.join(" ")}
            </span>
          </h1>
          <p className="hero__lead">{getCopy(content.site.heroLead, locale)}</p>
          <div className="hero__actions">
            <Link className="cta cta--primary" href={withLocale("/galerii", locale)}>
              {t("Vaata galeriid", "View the gallery")}
            </Link>
            <Link className="cta cta--ghost" href={withLocale("/kunstnik", locale)}>
              {t("Kunstnikust", "About the artist")}
            </Link>
          </div>
        </div>

        <div className="hero__visual">
          <span aria-hidden="true" className="hero__glow" />
          <figure className="hero__portrait">
            <img
              alt={artist.name}
              className="hero__photo"
              fetchPriority="high"
              src={artist.heroImage}
            />
          </figure>
        </div>

      </section>

      <section className="works" id="looming">
        <div className="works__heading" data-reveal>
          <p className="eyebrow">{t("Looming", "Works")}</p>
          <h2>{t("Valik teoseid", "Selected works")}</h2>
          <p className="section-copy">{getCopy(content.site.worksIntro, locale)}</p>
        </div>

        <div className="works__grid">
          {works.map((artwork, index) => (
            <Link
              className="works__item"
              data-reveal
              href={withLocale("/galerii", locale)}
              key={artwork.slug}
              style={{ "--wi": index }}
            >
              <span className="works__image-wrap">
                <img
                  alt={getCopy(artwork.title, locale)}
                  className="works__image"
                  loading={index < 2 ? "eager" : "lazy"}
                  src={artwork.image}
                />
              </span>
              <span className="works__caption">
                <strong>{getCopy(artwork.title, locale)}</strong>
              </span>
            </Link>
          ))}
        </div>

        <div className="works__more" data-reveal>
          <Link className="inline-link" href={withLocale("/galerii", locale)}>
            {t("Kõik teosed galeriiruumis", "All works in the gallery room")}
          </Link>
        </div>
      </section>

      <section className="statement" data-reveal>
        <blockquote className="statement__quote">
          {getCopy(artist.statement, locale)}
        </blockquote>
        <p className="statement__source">— {artist.name}</p>
      </section>

      <section className="kontakt" id="kontakt" data-reveal>
        <div className="kontakt__intro">
          <p className="eyebrow">{getCopy(content.site.contactTitle, locale)}</p>
          <p className="section-copy kontakt__text">
            {getCopy(content.site.contactText, locale)}
          </p>
        </div>

        <div className="kontakt__details">
          <a className="kontakt__item" href={`mailto:${content.contact.email}`}>
            <span className="kontakt__label">{t("E-post", "Email")}</span>
            <span className="kontakt__value">{content.contact.email}</span>
          </a>
          <a className="kontakt__item" href={`tel:${phoneHref}`}>
            <span className="kontakt__label">{t("Telefon", "Phone")}</span>
            <span className="kontakt__value">{content.contact.phone}</span>
          </a>
          {content.contact.instagram && content.contact.instagramUrl ? (
            <a
              className="kontakt__item"
              href={content.contact.instagramUrl}
              rel="noreferrer"
              target="_blank"
            >
              <span className="kontakt__label">Instagram</span>
              <span className="kontakt__value">{content.contact.instagram}</span>
            </a>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
