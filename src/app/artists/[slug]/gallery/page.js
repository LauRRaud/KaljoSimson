import Link from "next/link";
import GalleryClient from "@/components/GalleryClient";
import PageShell from "@/components/PageShell";
import { getCopy } from "@/lib/content-helpers";
import { getSiteContent } from "@/lib/content-store";
import { getLocaleFromSearchParams, withLocale } from "@/lib/locale";
import { notFound } from "next/navigation";

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const locale = getLocaleFromSearchParams(query);
  const content = await getSiteContent();
  const artist = content.artists.find((entry) => entry.slug === slug);

  if (!artist) {
    return {
      title: locale === "en" ? "Gallery not found" : "Galerii puudub",
    };
  }

  return {
    title: locale === "en" ? `${artist.name} gallery` : `${artist.name} galerii`,
    description: getCopy(artist.galleryIntro, locale),
  };
}

export default async function ArtistGalleryPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const locale = getLocaleFromSearchParams(query);
  const content = await getSiteContent();
  const artist = content.artists.find((entry) => entry.slug === slug);

  if (!artist) {
    notFound();
  }

  return (
    <PageShell content={content} locale={locale}>
      <section className="section">
        <div className="section-heading section-heading--centered">
          <Link
            className="inline-link"
            href={withLocale(`/artists/${artist.slug}`, locale)}
          >
            {locale === "en" ? "Back to profile" : "Tagasi profiili"}
          </Link>
          <h1>{locale === "en" ? "Gallery" : "Galerii"}</h1>
        </div>

        <GalleryClient artist={artist} locale={locale} />
      </section>
    </PageShell>
  );
}
