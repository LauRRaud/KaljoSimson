import HomeArtistCarousel from "@/components/HomeArtistCarousel";
import HomeScrollCue from "@/components/HomeScrollCue";
import PageShell from "@/components/PageShell";
import { getCopy } from "@/lib/content-helpers";
import { getSiteContent } from "@/lib/content-store";
import { getLocaleFromSearchParams } from "@/lib/locale";

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

  return (
    <PageShell content={content} locale={locale} showHeader>
      <section className="home-title">
        <div className="home-title__inner">
          <h1 className="home-title__brand">{content.site.title}</h1>
          <p className="home-title__copy">
            {getCopy(content.site.heroText, locale)}
          </p>
        </div>
        <HomeScrollCue locale={locale} />
      </section>

      <section className="section section--artists" id="artists">
        <HomeArtistCarousel artists={content.artists} locale={locale} />
      </section>

      <section className="section section--contact" id="contact">
        <div className="section-heading">
          <h2>{getCopy(content.site.contactTitle, locale)}</h2>
          <p className="section-copy">
            {getCopy(content.site.contactText, locale)}
          </p>
          <div className="contact-inline">
            <a className="contact-inline__line" href={`mailto:${content.contact.email}`}>
              {content.contact.email}
            </a>
            <a
              className="contact-inline__line"
              href={`tel:${content.contact.phone.replace(/\s+/g, "")}`}
            >
              {content.contact.phone}
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
