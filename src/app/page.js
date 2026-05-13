import HomeArtistCarousel from "@/components/HomeArtistCarousel";
import HomeScrollCue from "@/components/HomeScrollCue";
import PageShell from "@/components/PageShell";
import { getCopy } from "@/lib/content-helpers";
import { getSiteContent } from "@/lib/content-store";
import { getLocaleFromSearchParams } from "@/lib/locale";

function renderContactCopy(copy) {
  const noBreakTerm = "e-posti";

  if (!copy.includes(noBreakTerm)) {
    return copy;
  }

  const [before, ...after] = copy.split(noBreakTerm);

  return (
    <>
      {before}
      <span className="text-nowrap">{noBreakTerm}</span>
      {after.join(noBreakTerm)}
    </>
  );
}

function renderHomeTitle(title) {
  if (title === "BeyondFrames") {
    return (
      <>
        <span className="home-title__brand-word">Beyond</span>
        <span className="home-title__brand-word">Frames</span>
      </>
    );
  }

  return title;
}

const desktopWordStep = 4.2;
const mobileWordStep = desktopWordStep;
const desktopCycleEndPause = 2.2;
const mobileCycleEndPause = desktopCycleEndPause;

function renderTaglineWords(words) {

  return words.map((word, index) => (
    <span
      aria-hidden="true"
      className="home-title__tagline-word"
      key={`${word}-${index}`}
      style={{
        "--word-index": index,
        "--word-delay": `${index * desktopWordStep}s`,
        "--word-mobile-delay": `${index * mobileWordStep}s`,
      }}
    >
      {word}
    </span>
  ));
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
  const contactText = getCopy(content.site.contactText, locale);
  const tagline = getCopy(content.site.tagline, locale).trim().replace(",", "");
  const taglineWords = tagline ? tagline.split(/\s+/) : [];

  return (
    <PageShell
      content={content}
      locale={locale}
      shellClassName="page-shell--gallery-surface"
      mainClassName="page-main--home"
      showHeader
    >
      <section className="home-title">
        <div className="home-title__inner">
          <h1 className="home-title__brand" aria-label={content.site.title}>
            {renderHomeTitle(content.site.title)}
          </h1>
          {tagline ? (
            <p
              className="home-title__tagline"
              aria-label={tagline}
              style={{
                "--tagline-cycle-duration": `${taglineWords.length * desktopWordStep + desktopCycleEndPause}s`,
                "--tagline-mobile-cycle-duration": `${taglineWords.length * mobileWordStep + mobileCycleEndPause}s`,
              }}
            >
              {renderTaglineWords(taglineWords)}
            </p>
          ) : null}
          <div className="home-title__story">
            <p className="home-title__copy">
              {getCopy(content.site.heroText, locale)}
            </p>
          </div>
        </div>
        <HomeScrollCue locale={locale} />
      </section>

      <section className="section section--artists" id="artists">
        <h2 className="section--artists__title">
          {locale === "en" ? "Artists" : "Kunstnikud"}
        </h2>
        <HomeArtistCarousel
          artists={content.artists}
          initialArtistSlug="kaljo-simson"
          locale={locale}
        />
      </section>

      <section className="section section--contact" id="contact">
        <div className="section-heading">
          <h2>{getCopy(content.site.contactTitle, locale)}</h2>
          <p className="section-copy">
            {renderContactCopy(contactText)}
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
